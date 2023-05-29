import { Button } from '@automattic/components';
import { MEDIA_QUERIES } from '../utils';

interface EmptyStateCTAProps {
	heading?: string;
	description: string;
	label: string;
	target: string;
}

export const EmptyStateCTA = ( { description, label, target }: EmptyStateCTAProps ) => {
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
			<Button href={ target } primary>
				{ label }
			</Button>
		</div>
	);
};
