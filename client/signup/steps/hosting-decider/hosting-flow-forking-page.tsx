import EmptyContent from 'calypso/components/empty-content';
import { MEDIA_QUERIES } from '../../../sites-dashboard/utils';
import { CreateSiteCTA, MigrateSiteCTA } from './hosting-flow-forking-ctas';

export const HostingFlowForkingPage = () => {
	return (
		<EmptyContent
			css={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: 0,
				padding: 0,
				gap: '32px',
				[ MEDIA_QUERIES.small ]: {
					width: '100%',
					maxWidth: '100%',
					alignItems: 'flex-start',
				},
			} }
			title=""
			illustration=""
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
