import { useFocusedCartAction } from '../../hooks/use-focused-cart-action';
import { useDomainSearch } from '../domain-search';
import { DomainSuggestionContinueCTA } from './continue';
import { DomainSuggestionErrorCTA } from './error';
import { DomainSuggestionPrimaryCTA } from './primary';

import './style.scss';

export interface DomainSuggestionCTAProps {
	uuid: string;
	onClick?( action: 'add-to-cart' | 'continue' ): void;
	disabled?: boolean;
}

const DomainSuggestionCTA = ( { uuid, onClick, disabled }: DomainSuggestionCTAProps ) => {
	const { cart, onContinue } = useDomainSearch();
	const { isBusy, errorMessage, callback } = useFocusedCartAction( () => {
		onClick?.( 'add-to-cart' );
		cart.onAddItem( uuid );
	} );

	const isDomainOnCart = cart.hasItem( uuid );

	if ( isDomainOnCart ) {
		const handleContinueClick = () => {
			onClick?.( 'continue' );
			onContinue();
		};

		return (
			<DomainSuggestionContinueCTA
				disabled={ disabled || cart.isBusy }
				onClick={ handleContinueClick }
			/>
		);
	}

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ callback } />;
	}

	return (
		<DomainSuggestionPrimaryCTA
			onClick={ callback }
			disabled={ disabled || cart.isBusy }
			isBusy={ isBusy }
		/>
	);
};

DomainSuggestionCTA.Primary = DomainSuggestionPrimaryCTA;

export { DomainSuggestionCTA };
