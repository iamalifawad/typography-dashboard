class Dashboard {
    constructor() {
        this.form = document.getElementById('typographyForm');
        this.generateBtn = document.getElementById('generateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.rootFontSizeSelect = document.getElementById('rootFontSize');
        this.darkModeToggle = document.getElementById('darkModeToggle');

        this.previewSection = document.getElementById('previewSection');
        this.outputSection = document.getElementById('outputSection');
        this.tokenTableSection = document.getElementById('tokenTableSection');

        this.cssOutput = document.getElementById('cssOutput');
        this.copyFeedback = document.getElementById('copyFeedback');
        this.viewportMinInput = document.getElementById('viewportMin');
        this.viewportMaxInput = document.getElementById('viewportMax');

        // Ratio selects and custom inputs
        this.typeRatioMobileSelect = document.getElementById('typeRatioMobileSelect');
        this.typeRatioMobileCustom = document.getElementById('typeRatioMobileCustom');
        this.typeRatioDesktopSelect = document.getElementById('typeRatioDesktopSelect');
        this.typeRatioDesktopCustom = document.getElementById('typeRatioDesktopCustom');

        this.tokenLabels = {
            'body-xs': 'Extra Small',
            'body-s': 'Small',
            'body-m': 'Medium',
            'body-l': 'Large',
            'body-xl': 'Extra Large',
            'title-6': 'Title 6',
            'title-5': 'Title 5',
            'title-4': 'Title 4',
            'title-3': 'Title 3',
            'title-2': 'Title 2',
            'title-1': 'Title 1'
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.loadDarkMode();
        this.bindEvents();
        this.setupRatioSelects();
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generate());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.copyBtn.addEventListener('click', () => this.copy());
        this.rootFontSizeSelect.addEventListener('change', () => this.handleRootFontSizeChange());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.viewportMinInput.addEventListener('input', () => this.updateViewportDisplay());
        this.viewportMaxInput.addEventListener('input', () => this.updateViewportDisplay());
        this.typeRatioMobileSelect.addEventListener('change', () => this.handleMobileRatioChange());
        this.typeRatioDesktopSelect.addEventListener('change', () => this.handleDesktopRatioChange());
    }

    setupRatioSelects() {
        // Set default values from stored data if available
        const stored = storage.load('values');
        if (stored) {
            if (stored.typeRatioMobile && stored.typeRatioMobile !== 1.125) {
                this.typeRatioMobileSelect.value = 'custom';
                this.typeRatioMobileCustom.value = stored.typeRatioMobile;
                this.typeRatioMobileCustom.style.display = 'block';
            }
            if (stored.typeRatioDesktop && stored.typeRatioDesktop !== 1.2) {
                this.typeRatioDesktopSelect.value = 'custom';
                this.typeRatioDesktopCustom.value = stored.typeRatioDesktop;
                this.typeRatioDesktopCustom.style.display = 'block';
            }
        }
    }

    handleMobileRatioChange() {
        const value = this.typeRatioMobileSelect.value;
        if (value === 'custom') {
            this.typeRatioMobileCustom.style.display = 'block';
            this.typeRatioMobileCustom.focus();
        } else {
            this.typeRatioMobileCustom.style.display = 'none';
            this.typeRatioMobileCustom.value = value;
        }
    }

    handleDesktopRatioChange() {
        const value = this.typeRatioDesktopSelect.value;
        if (value === 'custom') {
            this.typeRatioDesktopCustom.style.display = 'block';
            this.typeRatioDesktopCustom.focus();
        } else {
            this.typeRatioDesktopCustom.style.display = 'none';
            this.typeRatioDesktopCustom.value = value;
        }
    }

    updateViewportDisplay() {
        const displays = document.querySelectorAll('.viewport-display');
        if (displays.length >= 2) {
            displays[0].textContent = this.viewportMinInput.value;
            displays[1].textContent = this.viewportMaxInput.value;
        }
    }

    handleRootFontSizeChange() {
        this.saveToStorage(this.getFormValues());
        this.showSuccess('Root font size updated!');
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.darkModeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    loadDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.darkModeToggle.textContent = '☀️ Light Mode';
        }
    }

    getFormValues() {
        const typeRatioMobile = this.typeRatioMobileSelect.value === 'custom' 
            ? parseFloat(this.typeRatioMobileCustom.value)
            : parseFloat(this.typeRatioMobileSelect.value);

        const typeRatioDesktop = this.typeRatioDesktopSelect.value === 'custom'
            ? parseFloat(this.typeRatioDesktopCustom.value)
            : parseFloat(this.typeRatioDesktopSelect.value);

        return {
            viewportMin: parseInt(this.viewportMinInput.value),
            viewportMax: parseInt(this.viewportMaxInput.value),
            typeBaseMin: parseFloat(document.getElementById('typeBaseMin').value),
            typeBaseMax: parseFloat(document.getElementById('typeBaseMax').value),
            typeRatioMobile: typeRatioMobile,
            typeRatioDesktop: typeRatioDesktop,
            rootFontSize: parseInt(this.rootFontSizeSelect.value)
        };
    }

    generate() {
        const values = this.getFormValues();
        const calculator = new TypographyCalculator(values);
        const css = calculator.generateCss();

        this.cssOutput.textContent = css;
        this.outputSection.classList.add('section-show');
        this.outputSection.style.display = 'block';

        this.generatePreview(calculator);
        this.generateTokenTable(calculator);

        this.saveToStorage(values);
        this.showSuccess('CSS generated successfully!');
    }

    generatePreview(calculator) {
        const preview = calculator.getPreviewSizes();
        let beforeHtml = '';
        let afterHtml = '';

        calculator.tokens.forEach(token => {
            const size = preview[token];
            const label = this.tokenLabels[token] || token;

            beforeHtml += `
                <div class="preview-item">
                    <div class="preview-label">${token}</div>
                    <div style="font-size: ${size.mobile}px; font-weight: 600; color: #2d3748;">${label}</div>
                </div>
            `;

            afterHtml += `
                <div class="preview-item">
                    <div class="preview-label">${token}</div>
                    <div style="font-size: ${size.desktop}px; font-weight: 600; color: #2d3748;">${label}</div>
                </div>
            `;
        });

        document.getElementById('beforePreview').innerHTML = beforeHtml;
        document.getElementById('afterPreview').innerHTML = afterHtml;

        this.previewSection.classList.add('section-show');
        this.previewSection.style.display = 'block';
    }

    generateTokenTable(calculator) {
        const preview = calculator.getPreviewSizes();
        let html = '';

        calculator.tokens.forEach(token => {
            const size = preview[token];
            html += `
                <tr>
                    <td><strong>${token}</strong></td>
                    <td>${size.mobile}px</td>
                    <td>${size.desktop}px</td>
                </tr>
            `;
        });

        document.getElementById('tokenTableBody').innerHTML = html;
        this.tokenTableSection.classList.add('section-show');
        this.tokenTableSection.style.display = 'block';
    }

    copy() {
        const css = this.cssOutput.textContent;
        navigator.clipboard.writeText(css).then(() => {
            this.copyFeedback.style.display = 'inline-block';
            setTimeout(() => {
                this.copyFeedback.style.display = 'none';
            }, 2000);
        }).catch(err => {
            this.showError('Failed to copy to clipboard');
        });
    }

    reset() {
        if (confirm('Reset to default values?')) {
            document.getElementById('viewportMin').value = 320;
            document.getElementById('viewportMax').value = 1440;
            document.getElementById('typeBaseMin').value = 1.4;
            document.getElementById('typeBaseMax').value = 1.6;
            this.typeRatioMobileSelect.value = '1.125';
            this.typeRatioDesktopSelect.value = '1.2';
            this.typeRatioMobileCustom.style.display = 'none';
            this.typeRatioDesktopCustom.style.display = 'none';
            document.getElementById('rootFontSize').value = 16;

            this.updateViewportDisplay();

            this.previewSection.style.display = 'none';
            this.outputSection.style.display = 'none';
            this.tokenTableSection.style.display = 'none';

            storage.clear();
            this.showSuccess('Reset to defaults!');
        }
    }

    saveToStorage(values) {
        storage.save('values', values);
    }

    loadFromStorage() {
        const stored = storage.load('values');
        if (stored) {
            document.getElementById('viewportMin').value = stored.viewportMin || 320;
            document.getElementById('viewportMax').value = stored.viewportMax || 1440;
            document.getElementById('typeBaseMin').value = stored.typeBaseMin || 1.4;
            document.getElementById('typeBaseMax').value = stored.typeBaseMax || 1.6;
            document.getElementById('rootFontSize').value = stored.rootFontSize || 16;

            // Handle ratio values
            if (stored.typeRatioMobile) {
                this.typeRatioMobileCustom.value = stored.typeRatioMobile;
            }
            if (stored.typeRatioDesktop) {
                this.typeRatioDesktopCustom.value = stored.typeRatioDesktop;
            }

            this.updateViewportDisplay();
        }
    }

    showSuccess(message) {
        const successEl = document.getElementById('success');
        successEl.textContent = message;
        successEl.style.display = 'block';
        setTimeout(() => {
            successEl.style.display = 'none';
        }, 3000);
    }

    showError(message) {
        const errorEl = document.getElementById('error');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});