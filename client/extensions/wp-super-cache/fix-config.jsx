/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class FixConfig extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Fix Configuration' ) } />
				<Card>
					<Button compact>
						{ translate( 'Restore Default Configuration' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( FixConfig );
