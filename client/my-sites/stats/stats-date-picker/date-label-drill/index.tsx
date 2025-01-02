import page from '@automattic/calypso-router';
import { Icon, levelUp } from '@wordpress/icons';
import { useState, useEffect, ReactNode } from 'react';
import { appendQueryStringForRedirection } from '../../utils';
import './index.scss';

interface QueryParams {
	drilldown?: string;
}

interface DateLabelDrillProps {
	query?: QueryParams;
	children?: ReactNode;
}

const DateLabelDrill = ( { query, children }: DateLabelDrillProps ) => {
	const [ isAnimated, setIsAnimated ] = useState( false );

	useEffect( () => {
		setIsAnimated( true );

		const params = { ...query };
		delete params.drilldown;
		const url = appendQueryStringForRedirection( window.location.pathname, params );
		window.history.replaceState( params, '', url );

		page.replace( url, null, false, false );
	}, [ query ] );

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
