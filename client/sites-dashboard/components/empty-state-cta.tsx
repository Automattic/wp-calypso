import { Button } from '@automattic/components';
import { MEDIA_QUERIES } from '../utils';

interface EmptyStateCTAProps {
	heading: string;
	description: string;
	cta: string;
	target: string;
}

export const EmptyStateCTA = ( { heading, description, cta, target }: EmptyStateCTAProps ) => {
	return (
		<div
			css={ {
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				[ MEDIA_QUERIES.small ]: {
					alignItems: 'flex-start',
					flexDirection: 'column',
					gap: '24px',
				},
			} }
		>
			<div
				css={ {
					display: 'flex',
					flexDirection: 'column',
					gap: '8px',
					alignItems: 'flex-start',
					marginRight: '32px',
				} }
			>
				<h2
					css={ {
						fontSize: '20px',
						lineHeight: '24px',
						color: '#101517',
					} }
				>
					{ heading }
				</h2>
				<span
					css={ {
						fontSize: '14px',
						lineHeight: '20px',
						color: '#646970',
					} }
				>
					{ description }
				</span>
			</div>
			<Button href={ target } primary>
				{ cta }
			</Button>
		</div>
	);
};
