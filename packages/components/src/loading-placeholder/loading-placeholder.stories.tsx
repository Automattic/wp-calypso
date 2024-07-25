import { LoadingPlaceholder } from '.';

export default { title: 'packages/components/LoadingPlaceholder' };

export const Normal = () => <LoadingPlaceholder />;
export const Width = () => <LoadingPlaceholder style={ { maxWidth: 300 } } />;
export const Delay = () => (
	<div style={ { display: 'grid', gap: 5 } }>
		<LoadingPlaceholder delayMS={ 0 } />
		<LoadingPlaceholder delayMS={ 150 } />
		<LoadingPlaceholder delayMS={ 300 } />
	</div>
);
export const ComplexLayout = () => (
	<div style={ { display: 'flex', gap: 5 } }>
		<LoadingPlaceholder style={ { maxWidth: 50, height: 50 } } />
		<div style={ { display: 'flex', flexDirection: 'column', flex: 1, gap: 5 } }>
			<LoadingPlaceholder />
			<LoadingPlaceholder style={ { maxWidth: '33%' } } />
		</div>
	</div>
);
