import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';

export function PerformanceScoreExplanation() {
	const explanation = translate(
		"The performance score is a combined representation of your page's individual speed metrics. {{button}}See calculator{{/button}} ↗",
		{
			components: {
				button: (
					<Button
						css={ {
							textDecoration: 'none !important',
							':hover': {
								textDecoration: 'underline !important',
							},
							fontSize: 'inherit',
							whiteSpace: 'nowrap',
						} }
						variant="link"
					/>
				),
				span: (
					<span
						style={ {
							fontVariantNumeric: 'tabular-nums',
						} }
					/>
				),
			},
		}
	);

	return <div>{ explanation }</div>;
}
