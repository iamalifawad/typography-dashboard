/**
 * Storage Manager
 * Handles localStorage operations for persisting user configurations
 */

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'tokenConfig';
        this.DARK_MODE_KEY = 'darkMode';
    }

    /**
     * Save configuration to localStorage
     * @param {Object} config - Configuration object to save
     */
    saveConfig(config) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Error saving configuration:', error);
        }
    }

    /**
     * Load configuration from localStorage
     * @returns {Object|null} - Saved configuration or null if not found
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading configuration:', error);
            return null;
        }
    }

    /**
     * Clear saved configuration
     */
    clearConfig() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing configuration:', error);
        }
    }

    /**
     * Save dark mode preference
     * @param {Boolean} isDarkMode - Dark mode state
     */
    saveDarkMode(isDarkMode) {
        try {
            localStorage.setItem(this.DARK_MODE_KEY, isDarkMode.toString());
        } catch (error) {
            console.error('Error saving dark mode preference:', error);
        }
    }

    /**
     * Load dark mode preference
     * @returns {Boolean} - Dark mode state
     */
    loadDarkMode() {
        try {
            return localStorage.getItem(this.DARK_MODE_KEY) === 'true';
        } catch (error) {
            console.error('Error loading dark mode preference:', error);
            return false;
        }
    }

    /**
     * Get default configuration values
     * @returns {Object} - Default configuration
     */
    getDefaults() {
        return {
            viewportMin: 320,
            viewportMax: 1440,
            typeBaseMin: 1.4,
            typeBaseMax: 1.6,
            typeRatioMobile: 1.125,
            typeRatioDesktop: 1.2,
            spaceBaseMin: 0.5,
            spaceBaseMax: 1.0,
            spaceRatio: 1.333,
            gapBaseMin: 0.75,
            gapBaseMax: 1.5,
            gapRatio: 1.333,
            rootFontSize: 16
        };
    }
}