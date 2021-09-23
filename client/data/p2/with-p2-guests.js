import { createHigherOrderComponent } from '@wordpress/compose';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';

const withP2Guests = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { data } = useP2GuestsQuery( props.site?.ID );
		return <Wrapped { ...props } p2Guests={ data } />;
	},
	'withP2Guests'
);

export default withP2Guests;
