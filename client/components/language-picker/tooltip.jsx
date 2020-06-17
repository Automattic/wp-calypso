/**
 * External dependencies
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Tooltip from 'components/tooltip';
import { getLanguage, isDefaultLocale, isMagnificentLocale } from 'lib/i18n-utils/utils';

function LanguagePickerItemTooltip( { langSlug } ) {
	const [ isVisible, setVisible ] = useState( false );
	const tooltipContainer = useRef( null );
	const translate = useTranslate();

	if ( isDefaultLocale( langSlug ) || isMagnificentLocale( langSlug ) ) {
		return null;
	}

	const showTooltip = () => setVisible( true );
	const hideTooltip = () => setVisible( false );

	const { name: language, translationsCoverage: percentage } = getLanguage( langSlug );

	return (
		<i
			className="language-picker__modal-notice"
			onMouseEnter={ showTooltip }
			onMouseLeave={ hideTooltip }
		>
			<Gridicon ref={ tooltipContainer } icon="notice-outline" size={ 18 } />

			<Tooltip
				className="language-picker__modal-tooltip"
				isVisible={ isVisible }
				context={ tooltipContainer && tooltipContainer.current }
			>
				{ translate(
					'%(language)s is only %(percentage)d% translated :(. {{br /}} You can help translate WordPress.com into your language. {{a}}Learn more.{{/a}}',
					{
						components: {
							a: <a href="https://translate.wordpress.com/faq/" />,
							br: <br />,
						},
						args: {
							language,
							percentage,
						},
					}
				) }
			</Tooltip>
		</i>
	);
}

LanguagePickerItemTooltip.propTypes = {
	langSlug: PropTypes.string,
};

LanguagePickerItemTooltip.defaultProps = {
	langSlug: '',
};

export default LanguagePickerItemTooltip;
