import ShortenedNumber from '..';
import formattedNumber from '../formatted-number';

export default { title: 'Shortened Number' };

const ShortenedNumberExample = ( { value } ) => (
	<p>
		{ String( value ) } becomes <ShortenedNumber value={ value } />
	</p>
);

const FormattedNumberExample = ( { value } ) => (
	<p>
		{ String( value ) } becomes { formattedNumber( value ) }
	</p>
);

const exampleValues = [ 0, 123, 12345, 12345678, 12345678901, 1.23456, 'Apple' ];

export const Default = () => (
	<>
		<div>
			<h1>Shortened numbers</h1>
			<div></div>
			{ exampleValues.map( ( item ) => (
				<ShortenedNumberExample value={ item } />
			) ) }
		</div>
		<div>
			<h1>Formatted numbers</h1>
			<div>Numbers formatted using the default formatter.</div>
			{ exampleValues.map( ( item ) => (
				<FormattedNumberExample value={ item } />
			) ) }
		</div>
	</>
);
