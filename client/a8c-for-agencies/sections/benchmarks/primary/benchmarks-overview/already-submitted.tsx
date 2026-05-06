import { __, sprintf } from '@wordpress/i18n';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';

type Props = {
	quarter: number;
	year: number;
};

export default function AlreadySubmitted( { quarter, year }: Props ) {
	return (
		<FormSection
			title={ sprintf(
				/* translators: %1$d: quarter number, %2$d: year. Example: Q1 2026 already submitted */
				__( 'Q%1$d %2$d already submitted' ),
				quarter,
				year
			) }
		>
			<p className="benchmarks-form__already-submitted">
				{ sprintf(
					/* translators: %1$d: quarter number, %2$d: year. */
					__(
						'You’ve already submitted your Q%1$d %2$d benchmarks. Come back after the next quarter ends to submit new numbers.'
					),
					quarter,
					year
				) }
			</p>
		</FormSection>
	);
}
