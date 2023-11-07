const E = {
    touchmoveFun: function (e) {
        e.preventDefault && e.preventDefault();
        e.returnValue = false;
        e.stopPropagation && e.stopPropagation();
        return false;
    },
    /*
     *	禁止滚动
     */
    moveStop: function () {
        window.addEventListener("touchmove", E.touchmoveFun, { passive: false });
    },
    /*
     *	可以滚动
     */
    moveStart: function () {
        window.removeEventListener("touchmove", E.touchmoveFun, { passive: false });
    },
}
export default E;