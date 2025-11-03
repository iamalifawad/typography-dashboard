/**
 * Dashboard UI Controller
 * Manages all UI interactions, events, and preview updates
 */

class DashboardUI {
    constructor() {
        this.generator = new TokenGenerator();
        this.storage = new StorageManager();
        this.generatedData = null;
        
        this.initElements();
        this.loadSavedValues();
        this.attachEventListeners();
        this.initDarkMode();
    }

    /**
     * Initialize all DOM element references
     */
    initElements() {
        this.elements = {
            // Form inputs
            viewportMin: document.getElementById('viewportMin'),
            viewportMax: document.getElementById('viewportMax'),
            typeBaseMin: document.getElementById('typeBaseMin'),
            typeBaseMax: document.getElementById('typeBaseMax'),
            typeRatioMobile: document.getElementById('typeRatioMobile'),
            typeRatioDesktop: document.getElementById('typeRatioDesktop'),
            spaceBaseMin: document.getElementById('spaceBaseMin'),
            spaceBaseMax: document.getElementById('spaceBaseMax'),
            spaceRatio: document.getElementById('spaceRatio'),
            gapBaseMin: document.getElementById('gapBaseMin'),
            gapBaseMax: document.getElementById('gapBaseMax'),
            gapRatio: document.getElementById('gapRatio'),
            
            // Root font size radios
            rootFont100: document.getElementById('rootFont100'),
            rootFont62: document.getElementById('rootFont62'),
            
            // Buttons
            generateBtn: document.getElementById('generateBtn'),
            resetBtn: document.getElementById('resetBtn'),
            copyTypography: document.getElementById('copyTypography'),
            copySpacing: document.getElementById('copySpacing'),
            copyGap: document.getElementById('copyGap'),
            darkModeToggle: document.getElementById('darkModeToggle'),
            darkModeIcon: document.getElementById('darkModeIcon'),
            
            // Output areas
            typographyOutput: document.getElementById('typographyOutput'),
            spacingOutput: document.getElementById('spacingOutput'),
            gapOutput: document.getElementById('gapOutput'),
            
            // Preview areas
            typographyPreview: document.getElementById('typographyPreview'),
            spacingPreview: document.getElementById('spacingPreview'),
            gapPreview: document.getElementById('gapPreview')
        };
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Button events
        this.elements.generateBtn.addEventListener('click', () => this.generate());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.copyTypography.addEventListener('click', () => this.copy('typography'));
        this.elements.copySpacing.addEventListener('click', () => this.copy('spacing'));
        this.elements.copyGap.addEventListener('click', () => this.copy('gap'));

        // Preview tab switching
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchPreviewTab(e.target.dataset.tab));
        });

        // Real-time generation on input change
        const inputs = [
            this.elements.viewportMin, this.elements.viewportMax,
            this.elements.typeBaseMin, this.elements.typeBaseMax,
            this.elements.typeRatioMobile, this.elements.typeRatioDesktop,
            this.elements.spaceBaseMin, this.elements.spaceBaseMax, this.elements.spaceRatio,
            this.elements.gapBaseMin, this.elements.gapBaseMax, this.elements.gapRatio
        ];

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.generatedData) {
                    this.generate();
                }
            });
        });

        // Root font size change
        [this.elements.rootFont100, this.elements.rootFont62].forEach(radio => {
            radio.addEventListener('change', () => {
                if (this.generatedData) {
                    this.generate();
                }
            });
        });
    }

    /**
     * Switch between preview tabs
     * @param {String} tab - Tab name (typography, spacing, gaps)
     */
    switchPreviewTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update content visibility
        document.querySelectorAll('.preview-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tab}Preview`).classList.add('active');
    }

    /**
     * Get current configuration from form inputs
     * @returns {Object} - Configuration object
     */
    getConfig() {
        return {
            viewportMin: parseFloat(this.elements.viewportMin.value),
            viewportMax: parseFloat(this.elements.viewportMax.value),
            typeBaseMin: parseFloat(this.elements.typeBaseMin.value),
            typeBaseMax: parseFloat(this.elements.typeBaseMax.value),
            typeRatioMobile: parseFloat(this.elements.typeRatioMobile.value),
            typeRatioDesktop: parseFloat(this.elements.typeRatioDesktop.value),
            spaceBaseMin: parseFloat(this.elements.spaceBaseMin.value),
            spaceBaseMax: parseFloat(this.elements.spaceBaseMax.value),
            spaceRatio: parseFloat(this.elements.spaceRatio.value),
            gapBaseMin: parseFloat(this.elements.gapBaseMin.value),
            gapBaseMax: parseFloat(this.elements.gapBaseMax.value),
            gapRatio: parseFloat(this.elements.gapRatio.value),
            rootFontSize: this.elements.rootFont100.checked ? 16 : 10
        };
    }

    /**
     * Generate all tokens and update UI
     */
    generate() {
        const config = this.getConfig();

        // Generate all token types
        const typography = this.generator.generateTypography(config);
        const spacing = this.generator.generateSpacing(config);
        const gaps = this.generator.generateGaps(config);

        this.generatedData = { typography, spacing, gaps };

        // Update CSS outputs
        this.elements.typographyOutput.textContent = typography.css;
        this.elements.spacingOutput.textContent = spacing.css;
        this.elements.gapOutput.textContent = gaps.css;

        // Update preview
        this.updatePreview(config, this.generatedData);

        // Apply CSS to document for live preview
        this.applyGeneratedCSS(config, typography, spacing, gaps);

        // Save to localStorage
        this.storage.saveConfig(config);
    }

    /**
     * Update preview sections with generated tokens
     * @param {Object} config - Current configuration
     * @param {Object} data - Generated token data
     */
    updatePreview(config, data) {
        // Typography Preview
        let typographyHTML = '';
        data.typography.tokens.forEach((token, i) => {
            typographyHTML += `
                <div class="typography-preview-item">
                    <div class="preview-label">${token}</div>
                    <div class="preview-text" style="font-size: var(--${token});">
                        The quick brown fox jumps over the lazy dog
                    </div>
                    <div class="preview-specs">
                        <span>Min: ${data.typography.minValues[i].toFixed(3)}rem</span>
                        <span>Max: ${data.typography.maxValues[i].toFixed(3)}rem</span>
                    </div>
                </div>
            `;
        });
        this.elements.typographyPreview.innerHTML = typographyHTML;

        // Spacing Preview
        let spacingHTML = '';
        data.spacing.tokens.forEach((token, i) => {
            spacingHTML += `
                <div class="spacing-preview-item">
                    <div class="spacing-inner" style="padding: var(--${token});">
                        <div>
                            <div style="font-weight: 700; margin-bottom: 0.25rem;">${token}</div>
                            <div style="font-size: 0.875rem; opacity: 0.9;">
                                ${data.spacing.minValues[i].toFixed(3)}rem - ${data.spacing.maxValues[i].toFixed(3)}rem
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        this.elements.spacingPreview.innerHTML = spacingHTML;

        // Gap Preview
        let gapHTML = '';
        data.gaps.tokens.forEach((token, i) => {
            gapHTML += `
                <div class="gap-preview-container" style="gap: var(--${token});">
                    <div style="text-align: center; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.5rem;">
                        ${token} (${data.gaps.minValues[i].toFixed(3)}rem - ${data.gaps.maxValues[i].toFixed(3)}rem)
                    </div>
                    <div class="gap-preview-item">Item 1</div>
                    <div class="gap-preview-item">Item 2</div>
                    <div class="gap-preview-item">Item 3</div>
                </div>
            `;
        });
        this.elements.gapPreview.innerHTML = gapHTML;
    }

    /**
     * Apply generated CSS to document for live preview
     * Note: Root font size only affects generated tokens, not the entire page
     * @param {Object} config - Current configuration
     * @param {Object} typography - Typography token data
     * @param {Object} spacing - Spacing token data
     * @param {Object} gaps - Gap token data
     */
    applyGeneratedCSS(config, typography, spacing, gaps) {
        // Remove old style if exists
        const oldStyle = document.getElementById('generated-tokens');
        if (oldStyle) oldStyle.remove();

        // Create and append new style
        const style = document.createElement('style');
        style.id = 'generated-tokens';
        
        // Important: We don't apply root font size to document
        // It only affects the calculations and CSS output
        // The preview uses the generated CSS variables which already
        // account for the root font size in their calculations
        
        let cssContent = '';
        
        // Combine all CSS (remove comments and merge :root declarations)
        cssContent += typography.css.replace(/\/\*.*?\*\/\n*/g, '').replace(/html.*?\n/g, '') + '\n';
        cssContent += spacing.css.replace(/\/\*.*?\*\/\n*/g, '').replace(':root {', '').replace(/html.*?\n/g, '') + '\n';
        cssContent += gaps.css.replace(/\/\*.*?\*\/\n*/g, '').replace(':root {', '').replace(/html.*?\n/g, '');
        
        style.textContent = cssContent;
        document.head.appendChild(style);
    }

    /**
     * Copy CSS to clipboard
     * @param {String} type - Token type (typography, spacing, gap)
     */
    copy(type) {
        let text, btn;
        
        if (type === 'typography') {
            text = this.elements.typographyOutput.textContent;
            btn = this.elements.copyTypography;
        } else if (type === 'spacing') {
            text = this.elements.spacingOutput.textContent;
            btn = this.elements.copySpacing;
        } else {
            text = this.elements.gapOutput.textContent;
            btn = this.elements.copyGap;
        }

        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    /**
     * Reset all values to defaults
     */
    reset() {
        const defaults = this.storage.getDefaults();

        // Update all form inputs
        Object.keys(defaults).forEach(key => {
            if (key === 'rootFontSize') {
                if (defaults[key] === 10) {
                    this.elements.rootFont62.checked = true;
                } else {
                    this.elements.rootFont100.checked = true;
                }
            } else if (this.elements[key]) {
                this.elements[key].value = defaults[key];
            }
        });

        // Clear localStorage
        this.storage.clearConfig();
        
        // Regenerate with defaults
        this.generate();
    }

    /**
     * Load saved values from localStorage
     */
    loadSavedValues() {
        const saved = this.storage.loadConfig();
        
        if (saved) {
            Object.keys(saved).forEach(key => {
                if (key === 'rootFontSize') {
                    if (saved[key] === 10) {
                        this.elements.rootFont62.checked = true;
                    } else {
                        this.elements.rootFont100.checked = true;
                    }
                } else if (this.elements[key]) {
                    this.elements[key].value = saved[key];
                }
            });
            
            // Auto-generate with saved values
            this.generate();
        }
    }

    /**
     * Initialize dark mode
     */
    initDarkMode() {
        const isDark = this.storage.loadDarkMode();
        
        if (isDark) {
            document.body.classList.add('dark-mode');
            this.elements.darkModeIcon.textContent = '☀️';
        }

        this.elements.darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            this.elements.darkModeIcon.textContent = isDarkMode ? '☀️' : '🌙';
            this.storage.saveDarkMode(isDarkMode);
        });
    }
}

// Initialize the dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardUI();
});