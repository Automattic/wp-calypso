import { useI18n } from '@wordpress/react-i18n';
import EmptyContent from 'calypso/components/empty-content';
import { MEDIA_QUERIES } from '../utils';
import { CreateSiteCTA, MigrateSiteCTA } from './sites-dashboard-ctas';

export const EmptySitesDashboard = () => {
	const { __ } = useI18n();

	return (
		<EmptyContent
			css={ {
				margin: 0,
				padding: 0,
				maxWidth: '480px',
				[ MEDIA_QUERIES.small ]: {
					width: '100%',
					alignItems: 'flex-start',
				},
			} }
			title={
				<h2
					css={ {
						fontSize: '44px',
						[ MEDIA_QUERIES.small ]: { fontSize: '28px', textAlign: 'left' },
						fontFamily: 'Recoleta, sans-serif',
					} }
				>
					{ __( "Let's add your first site" ) }
				</h2>
			}
			illustration=""
		>
			<div
				css={ {
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					marginTop: '56px',
					[ MEDIA_QUERIES.small ]: {
						marginTop: '32px',
					},
				} }
			>
				<CreateSiteCTA />
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
				<MigrateSiteCTA />
			</div>
		</EmptyContent>
	);
};
