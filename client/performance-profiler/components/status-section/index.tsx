import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import { Valuation } from 'calypso/performance-profiler/types/performance-metrics';

type StatusSectionProps = {
	value: Valuation;
	recommendationsQuantity?: number;
};

export const StatusSection = ( props: StatusSectionProps ) => {
	const translate = useTranslate();

	const { value, recommendationsQuantity } = props;
	const getStatus = ( value: Valuation ) => {
		if ( value === 'bad' ) {
			return 'poor';
		} else if ( value === 'needsImprovement' ) {
			return 'neutral';
		}
		return 'good';
	};
	const status = getStatus( value );
	const statusText = {
		poor: translate( 'Poor' ),
		neutral: translate( 'Needs improvement' ),
		good: translate( 'Excellent' ),
	}[ status ];

	return (
		<div className="status-section">
			<div className={ clsx( 'status-badge', { [ status ]: true } ) }>{ statusText }</div>
			<div className="recommendations-text">
				{ recommendationsQuantity &&
					translate(
						'{{a}}View %(quantity)d recommendation{{/a}}',
						'{{a}}View %(quantity)d recommendations{{/a}}',
						{
							count: recommendationsQuantity,
							args: { quantity: recommendationsQuantity },
							components: {
								a: (
									/* eslint-disable-next-line jsx-a11y/anchor-is-valid */
									<a role="button" tabIndex={ 0 } />
								),
							},
						}
					) }
			</div>
		</div>
	);
};
