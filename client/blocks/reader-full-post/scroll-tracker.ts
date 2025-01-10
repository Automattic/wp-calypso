/**
 * Tracks scroll depth for a container element.
 */
export default class ScrollTracker {
	private container: HTMLElement | null = null;
	private maxScrollDepth: number = 0;

	private handleScroll = (): void => {
		if ( ! this.container ) {
			return;
		}

		const scrollTop = this.container.scrollTop ?? 0;
		const scrollHeight = this.container.scrollHeight ?? 0;
		const clientHeight = this.container.clientHeight ?? 0;

		const denominator = scrollHeight - clientHeight;
		const scrollDepth = denominator <= 0 ? 0 : scrollTop / denominator;

		this.maxScrollDepth = calcAndClampMaxValue( scrollDepth, this.maxScrollDepth );
	};

	/**
	 * Sets the container element to track scrolling on.
	 * Removes scroll listener from previous container if it exists.
	 * @param container - The HTML element to track scrolling on, or null to stop tracking
	 */
	public setContainer( container: HTMLElement | null ): void {
		this.cleanup();
		this.resetMaxScrollDepth();
		this.container = container;
		if ( container ) {
			container.addEventListener( 'scroll', this.handleScroll );
		}
	}

	/**
	 * Gets the maximum scroll depth reached as a decimal between 0 and 1.
	 * @returns A number between 0 and 1 representing the maximum scroll depth
	 */
	public getMaxScrollDepth(): number {
		return this.maxScrollDepth;
	}

	/**
	 * Gets the maximum scroll depth reached as a percentage between 0 and 100.
	 * @returns A rounded number between 0 and 100 representing the maximum scroll depth percentage
	 */
	public getMaxScrollDepthAsPercentage(): number {
		return Math.round( this.maxScrollDepth * 100 );
	}

	/**
	 * Resets the maximum scroll depth back to 0.
	 */
	public resetMaxScrollDepth = (): void => {
		this.maxScrollDepth = 0;
	};

	/**
	 * Removes scroll event listener from container.
	 * Should be called when tracking is no longer needed.
	 */
	public cleanup(): void {
		if ( this.container ) {
			this.container.removeEventListener( 'scroll', this.handleScroll );
		}
	}
}

/**
 * Calculates the maximum value between two numbers and clamps the result between 0 and 1.
 * @param valueA - First number to compare
 * @param valueB - Second number to compare
 * @returns A number between 0 and 1 representing the maximum value between valueA and valueB
 */
function calcAndClampMaxValue( valueA: number, valueB: number ): number {
	return Math.min( 1, Math.max( 0, valueA, valueB ) );
}
