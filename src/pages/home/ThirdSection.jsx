import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

const PLUS_NUM = 0.012;

const ThirdTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  & > div:nth-child(1),
  & > div:nth-child(3) {
    height: 2px;
    background: rgba(255, 255, 255, 0.5);
    transition: width 0.3s ease-out;
  }
  & > div:nth-child(1) {
    width: ${(props) => props.$leftWidth}px;
  }
  & > div:nth-child(3) {
    width: ${(props) => props.$rightWidth}px;
  }
  & > p {
    margin: 0 10px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;

    /* 데스크탑 스타일 */
    @media (min-width: 768px) {
      font-size: 20px;
    }
  }

  /* 모바일 스타일 */
  @media (max-width: 768px) {
    justify-content: center;
    & > div:nth-child(1),
    & > div:nth-child(3) {
      width: ${(props) => props.$mobileWidth}px;
    }
  }
`;
const LocationWrap = styled.div`
  height: calc(100% - 92px);
  overflow-y: auto;
  gap: 8px;
  margin: 0 15px;
  padding: 0 17px;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 5px;
  }
  &::-webkit-scrollbar-track-piece {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    margin: 5px 0;
  }
`;

function ThirdSection() {
  const locations = useSelector((state) => state.location.locationList);
  const [inMaps, setInMaps] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leftWidth, setLeftWidth] = useState(window.innerWidth / 16);
  const [rightWidth, setRightWidth] = useState(window.innerWidth / 40);
  const [mobileWidth, setMobileWidth] = useState(window.innerWidth / 16);
  const [activeOverLay, setActiveOverLay] = useState(null);
  const map = useRef(null);

  const scrollPosition = useSelector((state) => state.scroll.scrollPosition);

  useEffect(() => {
    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  useEffect(() => {
    if (activeOverLay) {
      return () => {
        activeOverLay.setMap(null);
      };
    }
  }, [activeOverLay]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const threshold = window.innerHeight * 1.1;
    if (scrollPosition > threshold) {
      if (isMobile) {
        setMobileWidth(window.innerWidth / 4);
      } else {
        setLeftWidth(window.innerWidth / 16);
        setRightWidth(window.innerWidth / 5);
      }
    } else {
      if (isMobile) {
        setMobileWidth(window.innerWidth / 16);
      } else {
        setLeftWidth(window.innerWidth / 40);
        setRightWidth(window.innerWidth / 16);
      }
    }
  }, [isMobile, scrollPosition]);

  // 지도 생성 함수
  function initMap() {
    let mapContainer = document.getElementById("map"),
      mapOption = {
        center: new window.kakao.maps.LatLng(37.48322, 126.91562),
        level: 7,
      };

    map.current = new window.kakao.maps.Map(mapContainer, mapOption);

    updateInMaps(map.current.getBounds());
    window.kakao.maps.event.addListener(
      map.current,
      "bounds_changed",
      function () {
        updateInMaps(map.current.getBounds());
      }
    );

    initMarkers();
  }
  // 마커 생성 함수
  function initMarkers() {
    const imageSrc = "./images/marker.jpg";
    const imageSize = new window.kakao.maps.Size(28, 32);
    const imageOption = { offset: new window.kakao.maps.Point(14, 32) };
    const markerImage = new window.kakao.maps.MarkerImage(
      imageSrc,
      imageSize,
      imageOption
    );

    locations.forEach((loc) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(loc.latitude, loc.longitude),
        image: markerImage,
      });
      marker.setMap(map.current);
      const customOverlay = createOverLay(loc, marker);

      window.kakao.maps.event.addListener(marker, "click", function () {
        if (activeOverLay) activeOverLay.setMap(null);

        const moveLatLon = new window.kakao.maps.LatLng(
          marker.getPosition().getLat() + PLUS_NUM,
          marker.getPosition().getLng()
        );
        map.current.panTo(moveLatLon);
        customOverlay.setMap(map.current);
        setActiveOverLay(customOverlay);
      });
    });
  }
  // 커스텀 오버레이 생성 함수
  function createOverLay(loc, marker) {
    const overlayContent = document.createElement("div");
    overlayContent.className = "custom-overlay";
    overlayContent.innerHTML = `
      <div class="bg-gray-100 w-64 h-44 shadow-xl px-3 py-3 relative">
        <button 
          class="absolute top-3 right-3 opacity-30 hover:opacity-100" 
        ><img src="./images/x.jpg" alt=""/></button>
        <p class="font-bold text-base text-left mb-3">${loc.name}</p>
        <div class="flex gap-2"> 
          <img class="w-32 h-28" src="${loc.image}" />
          <div class="flex flex-col justify-between text-gray-500">
            <p class="text-xs whitespace-pre-wrap">${loc.address}</p>
            <p class="text-xs whitespace-pre-wrap">${loc.phone}</p>
          </div>
        </div>
      </div> 
    `;
    const customOverlay = new window.kakao.maps.CustomOverlay({
      content: overlayContent,
      map: map.current,
      position: marker.getPosition(),
      xAnchor: 0.49, // x 좌표 조절
      yAnchor: 1.23, // y 좌표 조절
    });

    customOverlay.setMap(null);

    const closeButton = overlayContent.querySelector("button");
    closeButton.onclick = function () {
      customOverlay.setMap(null);
      setActiveOverLay(null);
    };

    return customOverlay;
  }
  // 지도 영역 내부의 리스트 구하는 함수
  function updateInMaps(bounds) {
    let swLatlng = bounds.getSouthWest(); // 남서쪽
    let neLatlng = bounds.getNorthEast(); // 북동쪽

    const array = locations.filter(
      (loc) =>
        loc.latitude >= swLatlng.getLat() &&
        loc.latitude <= neLatlng.getLat() &&
        loc.longitude >= swLatlng.getLng() &&
        loc.longitude <= neLatlng.getLng()
    );
    setInMaps(array);
  }
  // 리스트의 항목 클릭시 이동하는 함수
  function moveCenter(loc) {
    if (activeOverLay) activeOverLay.setMap(null);
    const moveLatLon = new window.kakao.maps.LatLng(
      loc.latitude,
      loc.longitude
    );
    map.current.panTo(moveLatLon);
  }

  return (
    <div className="md:h-screen ">
      <div className="container mx-auto p-5 md:p-0 2xl:px-16">
        <ThirdTitle
          $leftWidth={leftWidth}
          $rightWidth={rightWidth}
          $mobileWidth={mobileWidth}
          className="mb-8"
        >
          <div />
          <p>매장 정보</p>
          <div />
        </ThirdTitle>

        <div className="container p-10 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg">
          <div className="flex flex-wrap">
            <div className="w-full md:w-7/12 mb-5 md:mb-0">
              <div
                id="map"
                className="w-full rounded-lg"
                style={{ height: "60vh" }}
              ></div>
            </div>
            <div
              className="rounded-lg w-full md:w-[38%] md:ml-auto bg-gray-100 bg-opacity-40 flex-col"
              style={{ height: "60vh" }}
            >
              <img
                src="/images/brandName.png"
                className="my-7 mx-auto w-52 h-9"
                alt=""
              />
              <LocationWrap>
                {inMaps.length !== 0 ? (
                  inMaps.map((item, index) => {
                    return (
                      <div
                        className="hover:scale-[1.03] hover:shadow-[0px_2px_15px_rgba(0,0,0,0.1)] hover:bg-opacity-50 hover:backdrop-blur-sm duration-300 cursor-pointer rounded-lg w-full bg-gray-100 bg-opacity-30 mt-2 mb-2"
                        style={{ height: "150px" }}
                        key={index}
                        onClick={() => moveCenter(item)}
                      >
                        <div className="flex flex-col gap-4 text-center md:text-left text-base md:text-xs lg:text-base lg py-5 px-7">
                          <p className="font-bold">{item.name}</p>
                          <p>{item.address}</p>
                          <p>{item.phone}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400">
                    검색 결과가 없습니다.
                  </p>
                )}
              </LocationWrap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThirdSection;
