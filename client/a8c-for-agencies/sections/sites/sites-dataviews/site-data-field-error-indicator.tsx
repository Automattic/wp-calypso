import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { SiteError } from '../types';

type Props = {
	errors?: SiteError[];
};

export default function SiteDataFieldErrorIndicator( { errors }: Props ) {
	const highestSeverity =
		errors?.reduce( ( prev, current ) => {
			const severityOrder: Record< string, number > = { high: 3, medium: 2, low: 1 };
			return severityOrder[ prev ] >= severityOrder[ current.severity ] ? prev : current.severity;
		}, 'low' ) ?? 'low';

	return (
		<div className={ clsx( 'sites-dataviews__site-error-indicator', `is-${ highestSeverity }` ) }>
			{ !! errors?.length && <Gridicon size={ 18 } icon="notice-outline" /> }
		</div>
	);
}
