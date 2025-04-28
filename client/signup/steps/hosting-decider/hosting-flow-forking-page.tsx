import { Button } from '@automattic/components';
import { NEW_HOSTED_SITE_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { MEDIA_QUERIES } from '../../../sites-dashboard/utils';
import { StepProps } from '.';

type HostingFlowCTAProps = {
	heading?: string;
	description: string;
	label: string;
	onClick: () => void;
};

export const HostingFlowCTA = ( { description, label, onClick }: HostingFlowCTAProps ) => {
	return (
		<div
			css={ {
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				[ MEDIA_QUERIES.small ]: {
					alignItems: 'flex-start',
					flexDirection: 'column',
					gap: '20px',
				},
			} }
		>
			<div
				css={ {
					marginRight: '32px',
				} }
			>
				<span
					css={ {
						textAlign: 'left',
						whiteSpace: 'nowrap',
						color: 'var(--studio-gray-100)',
					} }
				>
					{ description }
				</span>
			</div>
			<Button onClick={ onClick } primary>
				{ label }
			</Button>
		</div>
	);
};

export const HostingFlowForkingPage = ( props: StepProps ) => {
	const translate = useTranslate();
	const onClick = (
		stepperHostingFlow: typeof NEW_HOSTED_SITE_FLOW | typeof SITE_MIGRATION_FLOW
	) => {
		props.submitSignupStep(
			{
				stepName: props.stepName,
			},
			{ stepperHostingFlow }
		);
	};
	return (
		<div
			css={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: '10vh 35px 10px',
				padding: 0,
				gap: '32px',
			} }
		>
			<div
				css={ {
					display: 'flex',
					padding: '2px',
					flexDirection: 'column',
					[ MEDIA_QUERIES.small ]: {
						width: '100%',
					},
				} }
			>
				<HostingFlowCTA
					description={ translate( 'Build a new site from scratch' ) }
					label={ translate( 'Create a site' ) }
					onClick={ () => onClick( NEW_HOSTED_SITE_FLOW ) }
				/>
				<div
					css={ {
						margin: '32px 0',
						[ MEDIA_QUERIES.small ]: {
							margin: '24px 0',
						},

						'&:before': {
							content: '""',
							display: 'block',
							height: '1px',
							opacity: 0.64,
							background: '#DCDCDE',
						},
					} }
				/>
				<HostingFlowCTA
					description={ translate( 'Bring a site to WordPress.com' ) }
					label={ translate( 'Migrate a site' ) }
					onClick={ () => onClick( SITE_MIGRATION_FLOW ) }
				/>
			</div>
		</div>
	);
};
