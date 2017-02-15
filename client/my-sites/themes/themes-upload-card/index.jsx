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

const ThemeUploadCard = ( { label, count, translate } ) => {
	const uploadClassName = classNames( 'themes-upload-card', {
		'is-placeholder': count === null,
	} );

	return (
		<div className={ uploadClassName }>
			<SectionHeader
				label={ label || translate( 'WordPress.com themes' ) }
				count={ count } />
		</div>
	);
};

ThemeUploadCard.propTypes = {
	label: PropTypes.string,
	count: PropTypes.number
};

export default localize( ThemeUploadCard );
