const TimeLogo = ( props: React.SVGProps< SVGSVGElement > ) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={ 38 } height={ 27 } fill="none" { ...props }>
		<title>WordPress VIP client logo for TIME</title>
		<mask
			id="a"
			width={ 37 }
			height={ 11 }
			x={ 0 }
			y={ 9 }
			maskUnits="userSpaceOnUse"
			style={ {
				maskType: 'alpha',
			} }
		>
			<path fill="#fff" d="M36.999 9H.5v10.838h36.499V9Z" />
		</mask>
		<g mask="url(#a)">
			<path
				fill="#50575E"
				d="M.5 9.024h9.375v2.153h-.17l.02-1.38H6.02v9.714h1.07v.32H3.43v-.32h.99V9.798H.678v1.38H.5V9.023Zm9.823 0h3.683v.299h-1.05v10.192h1.046v.32H10.32v-.32h1.07V9.32h-1.07v-.295h.004ZM17.254 9h.705l3.446 8.334L24.827 9h.685l1.921 10.511h.967v.32h-3.803v-.32h.979l-1.189-6.719-3.041 7.046h-.713l-3.01-7.042-1.268 6.723h.923l-.02.32h-2.8l.02-.32h.855L17.254 9Zm11.467.024h8.107l.02 2.133h-.146l-.068-1.316-5.307-.06v4.267h4.515l.107-.997h.198c-.047.91-.047 1.795 0 2.696h-.198l-.107-1.029h-4.515v4.41h5.505l.016-1.467h.15v2.173h-8.277v-.303l1.069-.016V9.343l-1.07-.02v-.299Z"
			/>
		</g>
	</svg>
);
export { TimeLogo };
