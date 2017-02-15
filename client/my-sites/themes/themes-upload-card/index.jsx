/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import { localize } from 'i18n-calypso';

class ThemeUploadCard extends React.Component {

	static propTypes = {
		label: PropTypes.string,
		count: PropTypes.number,
	};

	render() {
		const { translate } = this.props;

		const uploadClassName = classNames( 'themes-upload-card', {
			'is-placeholder': this.props.count === null,
		} );

		return (
			<div className={ uploadClassName }>
				<SectionHeader
					label={ this.props.label || translate( 'WordPress.com themes' ) }
					count={ this.props.count } />
			</div>
		);
	}
}

export default localize( ThemeUploadCard );
