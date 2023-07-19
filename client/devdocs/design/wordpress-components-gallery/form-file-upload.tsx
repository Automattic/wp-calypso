import { FormFileUpload } from '@wordpress/components';

const FormFileUploadExample = () => (
	<FormFileUpload
		// @ts-expect-error The FormFileUpload components passes button props internally, but the types don't account for that.
		variant="primary"
		multiple
		onChange={ ( event ) =>
			window.alert( `${ event?.target?.files?.length ?? 0 } files uploaded!` )
		}
	>
		Click here to upload some files.
	</FormFileUpload>
);

export default FormFileUploadExample;
