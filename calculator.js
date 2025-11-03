class TypographyCalculator {
    constructor(config = {}) {
        this.config = {
            viewportMin: 320,
            viewportMax: 1440,
            typeBaseMin: 1.4,
            typeBaseMax: 1.6,
            typeRatioMobile: 1.125,
            typeRatioDesktop: 1.2,
            rootFontSize: 16,
            ...config
        };

        this.tokens = [
            'body-xs', 'body-s', 'body-m', 'body-l', 'body-xl',
            'title-6', 'title-5', 'title-4', 'title-3', 'title-2', 'title-1'
        ];

        this.initialize();
    }

    initialize() {
        this.calculateMinValues();
        this.calculateMaxValues();
    }

    calculateMinValues() {
        const base = this.config.typeBaseMin;
        const ratio = this.config.typeRatioMobile;

        this.minValues = {
            'body-xs': base / (ratio * ratio),
            'body-s': base / ratio,
            'body-m': base,
            'body-l': base * ratio,
            'body-xl': base * Math.pow(ratio, 2),
            'title-6': base * Math.pow(ratio, 3),
            'title-5': base * Math.pow(ratio, 4),
            'title-4': base * Math.pow(ratio, 5),
            'title-3': base * Math.pow(ratio, 6),
            'title-2': base * Math.pow(ratio, 7),
            'title-1': base * Math.pow(ratio, 8),
        };
    }

    calculateMaxValues() {
        const base = this.config.typeBaseMax;
        const ratio = this.config.typeRatioDesktop;

        this.maxValues = {
            'body-xs': base / (ratio * ratio),
            'body-s': base / ratio,
            'body-m': base,
            'body-l': base * ratio,
            'body-xl': base * Math.pow(ratio, 2),
            'title-6': base * Math.pow(ratio, 3),
            'title-5': base * Math.pow(ratio, 4),
            'title-4': base * Math.pow(ratio, 5),
            'title-3': base * Math.pow(ratio, 6),
            'title-2': base * Math.pow(ratio, 7),
            'title-1': base * Math.pow(ratio, 8),
        };
    }

    calculateFluidValue(minVal, maxVal) {
        // Convert rem to pixels using root font size
        const minPx = minVal * this.config.rootFontSize;
        const maxPx = maxVal * this.config.rootFontSize;
        
        // Viewport widths in pixels
        const vpMinPx = this.config.viewportMin;
        const vpMaxPx = this.config.viewportMax;

        // Calculate the viewport width range
        const vpRangePx = vpMaxPx - vpMinPx;
        
        // Calculate the font size range
        const fontSizeRangePx = maxPx - minPx;
        
        // Calculate vw percentage: (font size range / viewport range) * 100
        const vwPercent = (fontSizeRangePx / vpRangePx) * 100;
        
        // Calculate the offset in rem units
        // offset = minVal - (vpMinPx / 100) * (vwPercent / rootFontSize)
        // Simplified: minPx - (vpMinPx * vwPercent / 100) converted back to rem
        const offsetPx = minPx - (vpMinPx * vwPercent / 100);
        const offsetRem = offsetPx / this.config.rootFontSize;

        return {
            vw: vwPercent.toFixed(3),
            offset: offsetRem.toFixed(3),
        };
    }

    generateCss() {
        let css = '';

        this.tokens.forEach(token => {
            const minVal = this.minValues[token];
            const maxVal = this.maxValues[token];
            const fluid = this.calculateFluidValue(minVal, maxVal);

            const sign = parseFloat(fluid.offset) >= 0 ? '+' : '-';
            const offset = Math.abs(parseFloat(fluid.offset));

            css += `    --${token}: clamp(${minVal.toFixed(3)}rem, ${fluid.vw}vw ${sign} ${offset.toFixed(3)}rem, ${maxVal.toFixed(3)}rem);\n`;
        });

        return css;
    }

    getPreviewSizes() {
        const preview = {};
        const rootFontSize = this.config.rootFontSize;

        this.tokens.forEach(token => {
            const minVal = this.minValues[token];
            const maxVal = this.maxValues[token];

            preview[token] = {
                mobile: Math.round(minVal * rootFontSize),
                desktop: Math.round(maxVal * rootFontSize)
            };
        });

        return preview;
    }
}