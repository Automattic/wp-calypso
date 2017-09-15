/**
* External dependencies
*/
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SectionHeader from 'components/section-header';

class SectionHeaderExample extends PureComponent {
	static displayName = 'SectionHeader';

	render() {
		return (
			<div>
				<SectionHeader label="Team" count={ 10 }>
					<Button compact primary>Primary Action</Button>
					<Button compact>Manage</Button>
					<Button
						compact
						onClick={ function() {
							alert( 'Clicked add button' );
						} }
					>
						Add
					</Button>
				</SectionHeader>

				<h3>Clickable SectionHeader</h3>

				<SectionHeader label="Team" count={ 10 } href="/devdocs/design/section-header">
				</SectionHeader>

				<h3>Empty SectionHeader</h3>
				<SectionHeader />
			</div>
		);
	}
}

export default SectionHeaderExample;
