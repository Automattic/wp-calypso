import page from '@automattic/calypso-router';
import { Icon, levelUp } from '@wordpress/icons';
import { useState, useEffect, ReactNode } from 'react';
import { appendQueryStringForRedirection } from '../../utils';
import './index.scss';

interface QueryParams {
	drilldown?: string;
}

interface DateLabelDrillProps {
	context: {
		query: QueryParams;
		pathname: string;
	};
	children: ReactNode;
}

const DateLabelDrill = ( { context, children }: DateLabelDrillProps ) => {
	const [ isAnimated, setIsAnimated ] = useState( false );

	useEffect( () => {
		setIsAnimated( true );

		// Remove the `drilldown` query parameter to prevent unexpected go-backs from being shared by directly copying the URL.
		const params = { ...context.query };
		delete params.drilldown;
		const url = appendQueryStringForRedirection( context.pathname, params );
		window.history.replaceState( params, '', url );
		page.replace( url, null, false, false );
	}, [ context ] );

	const goBack = () => {
		window.history.back();
	};

	return (
		<div className={ `date-label-drill ${ isAnimated ? 'date-label-drill--is-animated' : '' }` }>
			<Icon className="gridicon" icon={ levelUp } onClick={ goBack } />
			{ children }
		</div>
	);
};

export default DateLabelDrill;
