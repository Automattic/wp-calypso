/**
 * Matches current values with target values using an intelligent pairing algorithm.
 *
 * This algorithm ensures optimal display of DNS record changes by:
 * 1. Showing values that are already correct (matched) on the same row
 * 2. Pairing incorrect values with their suggested replacements
 * 3. Marking missing values with '-' in currentValue (need to be added)
 * 4. Marking extra values with '-' in updateTo (should be removed)
 *
 * Algorithm Steps:
 * 1. Create a Set of target values for O(1) lookup performance
 * 2. Separate current values into two arrays:
 * - matched: values that exist in targets (already correct)
 * - unmatched: values that need to be changed or removed
 * 3. For each target value, pair it with:
 * - The same value if it exists in current (shows user it's correct)
 * - An unmatched current value (shows user what needs to change)
 * - '-' if no current values remain (shows user it needs to be added)
 * 4. Add any remaining unmatched current values with '-' as updateTo
 * - This shows users which records aren't needed and can be removed
 *
 * Example 1 - Basic matching:
 * ```
 * Current:  ['ns1.other.com', 'ns2.wordpress.com', 'ns3.other.com']
 * Target:   ['ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com']
 * Result:
 * ns2.wordpress.com → ns1.wordpress.com (matched, already correct)
 * ns1.other.com     → ns2.wordpress.com (unmatched, needs change)
 * ns3.other.com     → ns3.wordpress.com (unmatched, needs change)
 * ```
 *
 * Example 2 - Extra current values:
 * ```
 * Current:  ['ns1.other.com', 'ns2.other.com', 'ns3.other.com', 'ns4.other.com']
 * Target:   ['ns1.wordpress.com', 'ns2.wordpress.com']
 * Result:
 * ns1.other.com → ns1.wordpress.com (needs change)
 * ns2.other.com → ns2.wordpress.com (needs change)
 * ns3.other.com → -                  (extra, should be removed)
 * ns4.other.com → -                  (extra, should be removed)
 * ```
 * @param currentValues - Array of current DNS record values
 * @param targetValues - Array of desired target values
 * @returns Array of paired current→target value mappings
 */
export function matchCurrentToTargetValues(
	currentValues: string[],
	targetValues: string[]
): Array< { currentValue: string; updateTo: string } > {
	// Step 1: Create a Set of target values for efficient O(1) lookup
	const targetSet = new Set( targetValues );

	// Step 2: Separate current values into matched and unmatched arrays
	const matchedCurrent: string[] = [];
	const unmatchedCurrent: string[] = [];

	currentValues.forEach( ( value ) => {
		if ( targetSet.has( value ) ) {
			matchedCurrent.push( value );
		} else {
			unmatchedCurrent.push( value );
		}
	} );

	// Step 3: Create records by pairing each target with appropriate current value
	let unmatchedIndex = 0;
	const results = targetValues.map( ( targetValue ) => {
		let currentValue: string;

		// Check if this target value is already in use (correct value)
		if ( matchedCurrent.includes( targetValue ) ) {
			currentValue = targetValue;
			// Remove from matched list to handle duplicate target values correctly
			matchedCurrent.splice( matchedCurrent.indexOf( targetValue ), 1 );
		} else if ( unmatchedIndex < unmatchedCurrent.length ) {
			// Use an unmatched current value (value that needs to be changed)
			currentValue = unmatchedCurrent[ unmatchedIndex ];
			unmatchedIndex++;
		} else {
			// No more current values available, mark as '-' (needs to be added)
			currentValue = '-';
		}

		return { currentValue, updateTo: targetValue };
	} );

	// Step 4: Add any remaining unmatched current values with '-' as updateTo
	// This shows users which records should be removed
	for ( let i = unmatchedIndex; i < unmatchedCurrent.length; i++ ) {
		results.push( {
			currentValue: unmatchedCurrent[ i ],
			updateTo: '-',
		} );
	}

	return results;
}
