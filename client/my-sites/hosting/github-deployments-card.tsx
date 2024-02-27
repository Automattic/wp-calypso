import { Button, Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import CardHeading from '../../components/card-heading';
import SocialLogo from '../../components/social-logo';
import { indexPage } from '../github-deployments/routes';

export const GitHubDeploymentsCard = () => {
	const { __ } = useI18n();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Card
			highlight="primary"
			css={ { display: 'flex', alignItems: 'center', paddingBlock: '16px' } }
		>
			<SocialLogo
				className="material-icon"
				icon="github"
				size={ 32 }
				css={ { marginBottom: '0 !important' } }
			/>
			<div css={ { flex: 1 } }>
				<CardHeading size={ 14 } isBold css={ { margin: 0 } }>
					{ __( 'GitHub Deployments' ) }
				</CardHeading>
				<small css={ { marginBottom: 0 } }>
					{ __( 'Effortlessly deploy themes, plugins, or your entire site directly from GitHub!' ) }
				</small>
			</div>
			<Button primary compact href={ indexPage( siteSlug! ) }>
				{ __( 'Get started' ) }
			</Button>
		</Card>
	);
};
