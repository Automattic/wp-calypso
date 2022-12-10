import ShortenedNumber from '..';

export default { title: 'Shortened Number' };

const ShortenedNumberExample = ( { value } ) => (
	<p>
		{ String( value ) } becomes <ShortenedNumber value={ value } />
	</p>
);

export const Default = () => (
	<div>
		<ShortenedNumberExample value={ 0 } />
		<ShortenedNumberExample value={ 123 } />
		<ShortenedNumberExample value={ 12345 } />
		<ShortenedNumberExample value={ 12345678 } />
		<ShortenedNumberExample value={ 12345678901 } />
		<ShortenedNumberExample value={ 1.23456 } />
		<ShortenedNumberExample value="Apple" />
	</div>
);
