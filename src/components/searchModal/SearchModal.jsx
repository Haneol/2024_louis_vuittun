import React, { useEffect, useState } from "react";
import SearchModalItemGrid from "./SearchModalItemGrid";
import styled from "styled-components";
import SearchModalInput from "./SearchModalInput";
import data from "../../data";
import { useDispatch, useSelector } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import SearchModalCompleteModal from "./SearchModalCompleteModal";

const SearchbarArea = styled.div`
  width: 360px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 14px;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.3);
  }
`;

const renderThumb = ({ style, ...props }) => {
  const thumbStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: "4px",
  };
  return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

function SearchModal() {
  const [searchingData, setSearchingData] = useState([]);
  const [searchingText, setSearchingText] = useState("");
  const isSearchModalVisible = useSelector(
    (state) => state.modal.searchIsVisible
  );
  const searchWithText = (text) => {
    if (text.length !== 0 && text !== searchingText) {
      const filteringData =
        text !== "" ? data.filter((item) => item.name.includes(text)) : [];
      setSearchingData(filteringData);
      setSearchingText(text);
    }
  };
  const dispatch = useDispatch();
  useEffect(() => {
    setSearchingData([]);
  }, [isSearchModalVisible]);
  return (
    <>
      {isSearchModalVisible && (
        <div
          className="z-[1002] fixed top-0 w-full h-screen bg-black/20 backdrop-blur-[30px] overflow-y-auto justify-center items-center"
          onClick={() => {
            dispatch({ type: "@modal/searchClose" });
          }}
        >
          <SearchModalCompleteModal />
          <Scrollbars
            style={{ width: "100%", height: "100vh" }}
            renderThumbVertical={renderThumb}
            universal={true}
          >
            <div className="flex justify-center ">
              <div
                className="flex justify-center items-center mb-[60px] fixed top-6 gap-8 md:gap-0 z-[1010]"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <SearchbarArea>
                  <img
                    src={"/icons/search-normal.svg"}
                    alt="search"
                    className="mr-2"
                  />
                  <SearchModalInput onTextChange={searchWithText} />
                  <div className="ml-2 w-6 h-4" />
                </SearchbarArea>
                <div
                  className="block md:hidden text-white font-18 cursor-pointer transition duration-100 ease-in-out active:scale-95"
                  onClick={(e) => {
                    dispatch({ type: "@modal/searchClose" });
                  }}
                >
                  닫기
                </div>
              </div>
            </div>

            <div className="h-[100px]"></div>

            <div
              className="w-full px-8 mt-5 flex flex-col items-center m-auto"
              onClick={(e) => {
                dispatch({ type: "@modal/searchClose" });
                e.stopPropagation();
              }}
            >
              {!searchingData || searchingData.length === 0 ? (
                <div className="text-gray-100 font-20 text-center h-96 flex items-center">
                  검색 결과가 없어요
                </div>
              ) : (
                searchingData.map((item) => (
                  <SearchModalItemGrid key={item.id} item={item} />
                ))
              )}
            </div>
            <div className="h-40"></div>
          </Scrollbars>
        </div>
      )}
    </>
  );
}

export default SearchModal;
