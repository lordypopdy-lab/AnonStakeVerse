import { useEffect, useRef } from "react";

const Widget103 = () => {

  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark", // only accepts 'dark' or 'light'
      dateRange: "12M",
      exchange: "US",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: false,
      showFloatingTooltip: false,
      width: "100%",
      height: "100%",
      backgroundColor: "#081131", // override background, but may not fully apply
      plotLineColorGrowing: "rgba(41, 98, 255, 1)",
      plotLineColorFalling: "rgba(41, 98, 255, 1)",
      gridLineColor: "rgba(42, 46, 57, 0)",
      scaleFontColor: "rgba(219, 219, 219, 1)",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)"
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
  }, []);

    return (
        <div className="container my-4">
        <div
          className="tradingview-widget-container card p-3"
          style={{ backgroundColor: "#081131" }} // Force background color on wrapper
        >
          <div
            ref={containerRef}
            className="tradingview-widget-container__widget"
            style={{ width: "100%", height: "550px" }}
          />
          <div className="text-center mt-2">
          </div>
        </div>
      </div>
    )
}

export default Widget103
