import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useLocale } from '../../app/locale';

interface PerformanceSubtitleProps {
	timestamp: string;
}

export function PerformanceSubtitle( { timestamp }: PerformanceSubtitleProps ) {
	const locale = useLocale();
	const subtitle = timestamp
		? translate( 'Tested on {{span}}%(testedDate)s{{/span}}. {{button}}Test again{{/button}}', {
				args: {
					testedDate: new Date( timestamp ).toLocaleString( locale, {
						dateStyle: 'long',
						timeStyle: 'medium',
					} ),
				},
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
		  } )
		: __( 'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}' );

	return <div>{ subtitle }</div>;
}
