import { createHigherOrderComponent } from '@wordpress/compose';
import { useContext } from 'react';
import MomentContext from './context';

export const withLocalizedMoment = createHigherOrderComponent( ( Wrapped ) => {
	return function WithLocalizedMoment( props ) {
		return (
			<MomentContext.Consumer>
				{ ( momentState ) => <Wrapped { ...props } { ...momentState } /> }
			</MomentContext.Consumer>
		);
	};
}, 'WithLocalizedMoment' );

export const useLocalizedMoment = () => {
	const { moment } = useContext( MomentContext );
	return moment;
};
