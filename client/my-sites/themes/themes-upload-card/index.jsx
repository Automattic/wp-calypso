/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import { localize } from 'i18n-calypso';
import { trackClick } from '../helpers';

class ThemeUploadCard extends React.Component {

	static propTypes = {
		label: PropTypes.string,
		href: PropTypes.string,
		count: PropTypes.number,
	};

	trackClick = () => trackClick( 'upload theme' );

	render() {
		const { translate } = this.props;

		const uploadClassName = classNames( 'themes-upload-card', {
			'is-placeholder': this.props.count === null,
		} );

		return (
			<div className={ uploadClassName }>
				<SectionHeader
					label={ this.props.label || translate( 'WordPress.com themes' ) }
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
