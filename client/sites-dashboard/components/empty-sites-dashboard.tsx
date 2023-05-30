import { useI18n } from '@wordpress/react-i18n';
import EmptyContent from 'calypso/components/empty-content';
import { MEDIA_QUERIES } from '../utils';
import { CreateSiteCTA, MigrateSiteCTA } from './sites-dashboard-ctas';

const EmptySitesCTAs = () => {
	const { __ } = useI18n();

	return (
		<EmptyContent
			css={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: 0,
				padding: 0,
				[ MEDIA_QUERIES.small ]: {
					width: '100%',
					maxWidth: '100%',
					alignItems: 'flex-start',
				},
			} }
			title={
				<span
					css={ {
						color: 'var(--studio-gray-100)',
						fontSize: '3rem',
						fontWeight: 400,
						[ MEDIA_QUERIES.small ]: { fontSize: '2rem', textAlign: 'left' },
						fontFamily: 'Recoleta, sans-serif',
					} }
				>
					{ __( 'Let’s add your first site' ) }
				</span>
			}
			illustration=""
		>
			<div
				css={ {
					width: '85%',
					display: 'flex',
					gap: '32px',
					flexDirection: 'column',
					[ MEDIA_QUERIES.small ]: {
						width: '100%',
						gap: '24px',
					},
				} }
			>
				<CreateSiteCTA />
				<div
					css={ {
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

export const EmptySitesDashboard = () => {
	return (
		<div
			css={ {
				paddingTop: '20vh',
				[ MEDIA_QUERIES.small ]: {
					paddingTop: '60px',
				},
				zIndex: 9999,
				position: 'relative',
				display: 'flex',
				justifyContent: 'center',
			} }
		>
			<EmptySitesCTAs />
		</div>
	);
};
