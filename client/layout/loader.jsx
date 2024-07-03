import clsx from 'clsx';
import { useSelector } from 'react-redux';
import PulsingDot from 'calypso/components/pulsing-dot';
import { isSectionLoading } from 'calypso/state/ui/selectors';
import './loader.scss';

export default function LayoutLoader() {
	const isLoading = useSelector( isSectionLoading );

	return (
		<div className={ clsx( 'layout__loader', { 'is-active': isLoading } ) }>
			{ isLoading && <PulsingDot delay={ 400 } active /> }
		</div>
	);
}
