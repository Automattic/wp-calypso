import { localizeUrl } from '@automattic/i18n-utils';
import { ADDING_GSUITE_TO_YOUR_SITE } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';

import './style.scss';

const noop = () => {};

const GSuiteLearnMore = ( { onLearnMoreClick, productSlug } ) => {
	const translate = useTranslate();

	return (
		<div className="gsuite-learn-more">
			<p>
				{ translate(
					'{{strong}}No setup or software required.{{/strong}} ' +
						'{{a}}Learn more about integrating %(googleMailService)s with your site.{{/a}}',
					{
						args: {
							googleMailService: getGoogleMailServiceFamily( productSlug ),
						},
						comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
						components: {
							strong: <strong />,
							a: (
								<a
									className="gsuite-learn-more__link"
									href={ localizeUrl( ADDING_GSUITE_TO_YOUR_SITE ) }
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
