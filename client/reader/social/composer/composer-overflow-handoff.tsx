import './composer-overflow-handoff.scss';

import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';

interface ComposerOverflowHandoffProps {
	text: string;
}

export function ComposerOverflowHandoff( { text }: ComposerOverflowHandoffProps ) {
	const translate = useTranslate();
	const { hasBeenOverLimit } = useComposer();
	const config = useComposerConfig();

	const { data: sites } = useQuery( {
		...sitesQuery( 'all' ),
		enabled: hasBeenOverLimit,
	} );

	if ( ! hasBeenOverLimit ) {
		return null;
	}

	if ( ! sites || sites.length === 0 ) {
		return null;
	}

	return (
		<section
			className="social-composer__overflow-handoff"
			aria-label={ translate( 'Publish on your own site' ) as string }
		>
			{ /* Filled in by later tasks. */ }
			<p>
				{ translate( 'Too long for %(protocol)s? Publish it on your own site instead.', {
					args: { protocol: config.protocolLabel },
				} ) }
			</p>
			<p data-testid="overflow-handoff-debug-text">{ text }</p>
		</section>
	);
}
