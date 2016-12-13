/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { trackClick } from '../helpers';

class ThemeUploadCard extends React.Component {

	static propTypes = {
		href: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
	}

	trackClick = () => trackClick( 'upload theme' );

	render() {
		const { translate } = this.props;

		return (
			<Card className="themes-upload-card">
				<Button compact icon
					onClick={ this.trackClick }
					href={ this.props.href }
				>
					<Gridicon icon="cloud-upload" />
					{ translate( 'Upload Theme' ) }
				</Button>
			</Card>
		);
	}
}

export default localize( ThemeUploadCard );
