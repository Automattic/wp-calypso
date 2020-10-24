/**
 * External dependencies
 */
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ADDING_GOOGLE_APPS_TO_YOUR_SITE } from 'calypso/lib/url/support';

/**
 * Style dependencies
 */
import './style.scss';

const GSuiteLearnMore = ( { onLearnMoreClick } ) => {
	const translate = useTranslate();

	return (
		<div className="gsuite-learn-more">
			<p>
				{ translate(
					'{{strong}}No setup or software required.{{/strong}} ' +
						'{{a}}Learn more about integrating G Suite with your site.{{/a}}',
					{
						components: {
							strong: <strong />,
							a: (
								<a
									className="gsuite-learn-more__link"
									href={ ADDING_GOOGLE_APPS_TO_YOUR_SITE }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ onLearnMoreClick }
								/>
							),
						},
					}
				) }
			</p>
		</div>
	);
};

GSuiteLearnMore.propTypes = {
	onLearnMoreClick: PropTypes.func,
};

GSuiteLearnMore.defaultProps = {
	onLearnMoreClick: noop,
};

export default GSuiteLearnMore;
