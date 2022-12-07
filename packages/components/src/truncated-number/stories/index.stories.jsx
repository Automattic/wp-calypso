import TruncatedNumber from '../';

export default { title: 'Truncated Number' };

const TruncatedNumberExample = ( { value } ) => (
	<p>
		{ value } becomes <TruncatedNumber value={ value } />
	</p>
);

export const Default = () => (
	<div>
		<TruncatedNumberExample value={ 123 } />
		<TruncatedNumberExample value={ 12345 } />
		<TruncatedNumberExample value={ 12345678 } />
		<TruncatedNumberExample value={ 12345678901 } />
	</div>
);
