import { useEffect, useRef } from "react";

const Widget103 = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
            width: "100%",
            height: "100%",
            currencies: [
                "EUR",
                "USD",
                "JPY",
                "GBP",
                "CHF",
                "AUD",
                "CAD",
                "NZD"
            ],
            isTransparent: false,
            colorTheme: "dark",
            locale: "en",
            backgroundColor: "#081131"
        });

        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(script);
        }
    }, []);
    return (
        <div className="container">
            <div
                ref={containerRef}
                className="tradingview-widget-container__widget"
                style={{ width: "104%", height: "400px" }}
            />
        </div>
    )
}

export default Widget103
