import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Illustration from 'calypso/assets/images/illustrations/builder-referral.svg';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmptyContent from 'calypso/components/empty-content';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';

import './difm-lite-in-progress.scss';

type DIFMLiteInProgressProps = {
	siteId: number;
};

type DomainName = {
	name?: string;
};

function DIFMLiteInProgress( { siteId }: DIFMLiteInProgressProps ): React.ReactElement {
	const slug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	const primaryDomain: DomainName = useSelector( ( state: AppState ) =>
		getPrimaryDomainBySiteId( state, siteId )
	);
	const translate = useTranslate();

	if ( ! primaryDomain ) {
		return (
			<div>
				<QuerySiteDomains siteId={ siteId } />
				<EmptyContent
					className="difm-lite-in-progress__site-placeholder"
					illustration={ Illustration }
					illustrationWidth={ 225 }
				/>
			</div>
		);
	}

	const hasEmailWithUs = hasGSuiteWithUs( primaryDomain ) || hasTitanMailWithUs( primaryDomain );
	const domainName = primaryDomain.name;

	const recordEmailClick = () => {
		const tracksName = hasEmailWithUs
			? 'calypso_difm_lite_in_progress_email_manage'
			: 'calypso_difm_lite_in_progress_email_cta';
		recordTracksEvent( tracksName, {
			domain: domainName,
		} );
	};

	return (
		<div>
			<EmptyContent
				title={ translate( 'Hang on! Our experts are building your site.' ) }
				line={ translate(
					'Thank you for your purchase. ' +
						'Our Built By WordPress.com team will begin building your site soon. ' +
						'We’ll be in touch when your site is ready to be launched.'
				) }
				secondaryAction={ translate( 'Manage domain' ) }
				secondaryActionURL={ domainManagementEdit( slug, domainName ) }
				illustration={ Illustration }
				illustrationWidth={ 225 }
			>
				{
					<Button
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className="empty-content__action button"
						href={ emailManagement( slug, domainName ) }
						onClick={ recordEmailClick }
					>
						{ hasEmailWithUs ? translate( 'Manage email' ) : translate( 'Add email' ) }
					</Button>
				}
			</EmptyContent>
		</div>
	);
}

DIFMLiteInProgress.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default DIFMLiteInProgress;
