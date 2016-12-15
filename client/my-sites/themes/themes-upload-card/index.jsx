/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { trackClick } from '../helpers';

class ThemeUploadCard extends React.Component {

	static propTypes = {
		label: PropTypes.string,
		href: PropTypes.string,
		count: PropTypes.number,
	};

	constructor( props ) {
		super( props );
	}

	trackClick = () => trackClick( 'upload theme' );

	render() {
		const { translate } = this.props;

		return (
			<div className="themes-upload-card">
				<SectionHeader
					label={ this.props.label }
					count={ this.props.count }
				>
					{ this.props.href &&
						<Button compact icon
							onClick={ this.trackClick }
							href={ this.props.href }
						>
							<Gridicon icon="cloud-upload" />
							{ translate( 'Upload Theme' ) }
						</Button>
					}
				</SectionHeader>
			</div>
		);
	}
}

export default localize( ThemeUploadCard );
