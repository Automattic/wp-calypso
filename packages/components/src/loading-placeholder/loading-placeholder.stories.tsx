import { css } from '@emotion/css';
import { LoadingPlaceholder } from '.';

export default { title: 'Unaudited/LoadingPlaceholder' };

export const Normal = () => <LoadingPlaceholder />;
export const Width = () => <LoadingPlaceholder className={ css( { maxWidth: 300 } ) } />;
export const Delay = () => (
	<div className={ css( { display: 'grid', gap: 5 } ) }>
		<LoadingPlaceholder delayMS={ 0 } />
		<LoadingPlaceholder delayMS={ 150 } />
		<LoadingPlaceholder delayMS={ 300 } />
	</div>
);
export const ComplexLayout = () => (
	<div className={ css( { display: 'flex', gap: 5 } ) }>
		<LoadingPlaceholder className={ css( { maxWidth: 50, height: 50 } ) } />
		<div className={ css( { display: 'flex', flexDirection: 'column', flex: 1, gap: 5 } ) }>
			<LoadingPlaceholder />
			<LoadingPlaceholder className={ css( { maxWidth: '33%' } ) } />
		</div>
	</div>
);
