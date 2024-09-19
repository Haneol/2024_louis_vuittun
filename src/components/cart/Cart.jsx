import React, { useEffect, useState } from "react";
import CartItemGrid from "./CartItemGrid";
import CartFooter from "./CartFooter";
import { useSelector } from "react-redux";
import CartPayCompleteModal from "./CartPayCompleteModal";

function Cart() {
  const cartList = useSelector((state) => state.cart.cartList);
  const cartSet = cartList.filter(
    (obj, index, self) => index === self.findIndex((o) => o.id === obj.id)
  );
  const itemNum = (findingId) => {
    return cartList.filter((item) => item.id === findingId).length;
  };
  const [isVisible, setIsVisible] = useState(true);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  useEffect(() => {
    if (isVisible) {
      const cartContainer = document.querySelector(".cartContainer");
      const chkOverflow = (e) => {
        return e.scrollHeight > e.clientHeight;
      };
      setIsOverflow(chkOverflow(cartContainer));
      const handleResize = () => {
        setIsOverflow(chkOverflow(cartContainer));
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isVisible, setIsOverflow]);

  return (
    <>
      <div className="fixed top-0 right-0 ">
        {isVisible && (
          <div className="cartContainer overflow-y-auto fixed t-0 w-[500px] h-auto max-h-svh min-h-svh bg-white/20 border border-white/30 backdrop-blur-[80px] flex flex-col items-center right-0 max-md:left-1/2 max-md:-translate-x-1/2">
            <div className="text-white text-[32px] font-light font-['Pretendard'] leading-loose mt-9">
              장바구니
            </div>
            <div
              className="w-8 h-8 justify-center items-center inline-flex absolute top-[54px] left-[48px] cursor-pointer"
              onClick={() => setIsVisible(false)}
            >
              <img src="/icons/arrow-left.svg" alt="leftArrow" />
            </div>
            <div className="mt-9 space-y-5 mb-20 ">
              {cartList != []
                ? cartSet.map((i) => (
                    <CartItemGrid key={i.id} item={i} count={itemNum(i.id)} />
                  ))
                : ""}
            </div>
            {isOverflow ? (
              <div className=" bottom-7">
                <CartFooter isModalVisible={openModal} />
              </div>
            ) : (
              <div className="fixed bottom-7">
                <CartFooter isModalVisible={openModal} />
              </div>
            )}
          </div>
        )}
      </div>
      {isModalVisible && (
        <CartPayCompleteModal
          isModalVisible={closeModal}
          modalCloseTime={1000}
        />
      )}
    </>
  );
}

export default Cart;
