/**
 * Token Generator Class
 * Handles all mathematical calculations for typography, spacing, and gap tokens
 */

class TokenGenerator {
    /**
     * Generate typography tokens with fluid scaling
     * @param {Object} config - Configuration object
     * @returns {Object} - Contains css, tokens, minValues, maxValues
     */
    generateTypography(config) {
        const tokens = [
            'body-xs', 'body-s', 'body-m', 'body-l', 'body-xl',
            'title-6', 'title-5', 'title-4', 'title-3', 'title-2', 'title-1'
        ];
        
        // Power values for exponential scaling
        // body-xs (-2) to title-1 (+8)
        const powers = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
        
        // Calculate minimum values (mobile)
        const minValues = tokens.map((token, i) => 
            config.typeBaseMin * Math.pow(config.typeRatioMobile, powers[i])
        );
        
        // Calculate maximum values (desktop)
        const maxValues = tokens.map((token, i) => 
            config.typeBaseMax * Math.pow(config.typeRatioDesktop, powers[i])
        );
        
        return {
            css: this.generateClampCSS(tokens, minValues, maxValues, config.viewportMin, config.viewportMax, config.rootFontSize),
            tokens: tokens,
            minValues: minValues,
            maxValues: maxValues
        };
    }

    /**
     * Generate spacing tokens with fluid scaling
     * @param {Object} config - Configuration object
     * @returns {Object} - Contains css, tokens, minValues, maxValues
     */
    generateSpacing(config) {
        const tokens = ['space-xs', 'space-s', 'space-m', 'space-l', 'space-xl'];
        
        // Power values for spacing scale
        // space-xs (-1) to space-xl (+3)
        const powers = [-1, 0, 1, 2, 3];
        
        // Calculate minimum values (mobile)
        const minValues = tokens.map((token, i) => 
            config.spaceBaseMin * Math.pow(config.spaceRatio, powers[i])
        );
        
        // Calculate maximum values (desktop)
        const maxValues = tokens.map((token, i) => 
            config.spaceBaseMax * Math.pow(config.spaceRatio, powers[i])
        );
        
        return {
            css: this.generateClampCSS(tokens, minValues, maxValues, config.viewportMin, config.viewportMax, config.rootFontSize),
            tokens: tokens,
            minValues: minValues,
            maxValues: maxValues
        };
    }

    /**
     * Generate gap tokens with fluid scaling
     * @param {Object} config - Configuration object
     * @returns {Object} - Contains css, tokens, minValues, maxValues
     */
    generateGaps(config) {
        const tokens = ['gap-xs', 'gap-s', 'gap-m', 'gap-l', 'gap-xl'];
        
        // Power values for gap scale
        // gap-xs (-1) to gap-xl (+3)
        const powers = [-1, 0, 1, 2, 3];
        
        // Calculate minimum values (mobile)
        const minValues = tokens.map((token, i) => 
            config.gapBaseMin * Math.pow(config.gapRatio, powers[i])
        );
        
        // Calculate maximum values (desktop)
        const maxValues = tokens.map((token, i) => 
            config.gapBaseMax * Math.pow(config.gapRatio, powers[i])
        );
        
        return {
            css: this.generateClampCSS(tokens, minValues, maxValues, config.viewportMin, config.viewportMax, config.rootFontSize),
            tokens: tokens,
            minValues: minValues,
            maxValues: maxValues
        };
    }

    /**
     * Generate CSS with clamp() functions
     * @param {Array} tokens - Token names
     * @param {Array} minValues - Minimum rem values
     * @param {Array} maxValues - Maximum rem values
     * @param {Number} viewportMin - Minimum viewport width
     * @param {Number} viewportMax - Maximum viewport width
     * @param {Number} rootFontSize - Root font size (16 or 10)
     * @returns {String} - CSS code
     */
    generateClampCSS(tokens, minValues, maxValues, viewportMin, viewportMax, rootFontSize) {
        let css = ':root {\n';
        
        tokens.forEach((token, i) => {
            const min = minValues[i];
            const max = maxValues[i];
            
            // Linear interpolation formula
            // f(x) = slope * x + intercept
            const slope = (max - min) / (viewportMax - viewportMin);
            const intercept = min - slope * viewportMin;
            
            // Format values with 3 decimal places
            const minRem = min.toFixed(3);
            const maxRem = max.toFixed(3);
            const vwValue = (slope * 100).toFixed(3);
            const interceptRem = intercept.toFixed(3);
            
            // Generate clamp() CSS
            css += `    --${token}: clamp(${minRem}rem, ${vwValue}vw + ${interceptRem}rem, ${maxRem}rem);\n`;
        });
        
        css += '}';
        
        // Add root font size comment and rule
        if (rootFontSize === 10) {
            css = '/* Root font-size: 62.5% (10px) */\nhtml { font-size: 62.5%; }\n\n' + css;
        } else {
            css = '/* Root font-size: 100% (16px) */\n\n' + css;
        }
        
        return css;
    }

    /**
     * Calculate actual pixel size at a specific viewport
     * @param {Number} minValue - Minimum rem value
     * @param {Number} maxValue - Maximum rem value
     * @param {Number} viewportMin - Minimum viewport width
     * @param {Number} viewportMax - Maximum viewport width
     * @param {Number} currentViewport - Current viewport width
     * @param {Number} rootFontSize - Root font size (16 or 10)
     * @returns {String} - Pixel value with 2 decimal places
     */
    calculateActualSize(minValue, maxValue, viewportMin, viewportMax, currentViewport, rootFontSize) {
        const slope = (maxValue - minValue) / (viewportMax - viewportMin);
        
        // Clamp the value between min and max
        const remValue = Math.max(
            minValue, 
            Math.min(maxValue, minValue + slope * (currentViewport - viewportMin))
        );
        
        // Convert rem to pixels
        return (remValue * rootFontSize).toFixed(2);
    }
}