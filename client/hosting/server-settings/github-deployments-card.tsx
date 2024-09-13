import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Banner from '../../components/banner';
import SocialLogo from '../../components/social-logo';
import { indexPage } from '../github-deployments/routes';

export const GitHubDeploymentsCard = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Banner
			className="github-deployments-card"
			icon={ <SocialLogo icon="github" size={ 32 } /> }
			disableCircle
			callToAction={ __( 'Get started' ) }
			href={ indexPage( siteSlug! ) }
			title={ __( 'GitHub Deployments' ) }
			onClick={ () => {
				dispatch( recordTracksEvent( 'calypso_hosting_github_nudge_clicked' ) );
			} }
			description={ __(
				'Effortlessly deploy themes, plugins, or your entire site directly from GitHub!'
			) }
		/>
	);
};
