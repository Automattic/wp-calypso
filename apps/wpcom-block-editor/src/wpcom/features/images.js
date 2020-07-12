/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

export const ClassicBlockImage = ( props ) => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<>
		<img
			className="edit-post-welcome-guide__image edit-post-welcome-guide__image__prm-np" // eslint-disable wpcalypso/jsx-classname-namespace
			alt=""
			src="data:image/svg+xml,%3Csvg width='188' height='188' viewBox='0 0 188 188' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ccircle cx='94' cy='94' r='94' fill='white'/%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='188' height='188'%3E%3Ccircle cx='94' cy='94' r='94' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Crect x='15.3469' y='61.3877' width='434.318' height='64.4571' fill='url(%23pattern0)'/%3E%3C/g%3E%3Cdefs%3E%3Cpattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'%3E%3Cuse xlink:href='%23image0' transform='scale(0.000883392 0.00595238)'/%3E%3C/pattern%3E%3Cimage id='image0' width='1132' height='168' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABGwAAACoCAYAAAC1xnjtAAAgAElEQVR4Ae2debcURZ6G55N45q+e4yeaaW1cQBZBZBdEWWURkFUEQRQU3JW1kR2RRZB9bXaQfQe3np7p6ZmY86b9K6KyMquyqvJWRdZ97jl1MyuXyIg3nsyMeCuWf3H8oQAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKBKXAvwQVGyKDAiiAAiiAAiiAAiiAAiiAAiiAAiiAAijgMGyAAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAUCUwDDJrAMIToogAIogAIogAIogAIogAIogAIogAIogGEDAyiAAiiAAiiAAiiAAiiAAiiAAiiAAigQmAIYNoFlCNFBARRAARRAARRAARRAARRAARRAARRAAQwbGEABFEABFEABFEABFEABFEABFEABFECBwBTAsAksQ4gOCqAACqAACqAACqAACqAACqAACqAACmDYwAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKBKYAhk1gGUJ0UAAFUAAFUAAFUAAFUAAFUAAFUAAFUADDBgZQAAVQAAVQAAVQAAVQAAVQAAVQAAVQIDAFMGwCyxCigwIogAIogAIogAIogAIogAIogAIogAJNGTbHjx93vXr1cn/4wx/cE088wQcNYAAGYAAGYAAGYAAGYAAGYAAGYAAGYCAHBho2bGTWmEnzr//6r+7JJ5/kgwYwAAMwAAMwAAMwAAMwAAMwAAMwAAMwkAMDDRs2alkjw+avf/0rHzSAARiAARiAARiAARiAARiAARiAARiAgRwZaNiwUTcotazBsMGwggEYgAEYgAEYgAEYgAEYgAEYgAEYgIF8GWjYsFHrGnWDIkPyzRD0RE8YgAEYgAEYgAEYgAEYgAEYgAEYgAEMmxybK3FDcUPBAAzAAAzAAAzAAAzAAAzAAAzAAAzkwQCGDYYNraRgAAZgAAZgAAZgAAZgAAZgAAZgAAYCYwDDJrAMycOFIwzcXBiAARiAARiAARiAARiAARiAARgoNgMYNhg2uKgwAAMwAAMwAAMwAAMwAAMwAAMwAAOBMYBhE1iG4IAW2wEl/8g/GIABGIABGIABGIABGIABGICBPBjAsMGwwUWFARiAARiAARiAARiAARiAARiAARgIjAEMm8AyJA8XjjBwc2EABmAABmAABmAABmAABmAABmCg2Ay0zLC5ePGi44MGMFBsBnjgF/uBT/6RfzAAAzAAAzAAAzAAAzBQHAYwbDCSMNJgIDMDPNyL83Anr8grGIABGIABGIABGIABGCg2Ay03bH766SfHBw1goFgMWMsoHvjFfuCTf+QfDMAADMAADMAADMAADBSHgZYbNv/4xz8cHzSAgWIxgGFTnIc6L2DyCgZgAAZgAAZgAAZgAAY6g4GWGzaOPxRAgcIpgGHTGQ98XtzkIwzAAAzAAAzAAAzAAAwUhwEMm8JVnYkwCrReAQyb4jzUeQGTVzAAAzAAAzAAAzAAAzDQGQxg2LS+7ssVUaBwCmDYdMYDnxc3+QgDMAADMAADMAADMAADxWEAw6ZwVWcijAKtVwDDpjgPdV7A5BUMwAAMwAAMwAAMwAAMdAYDGDatr/tyRRQonAIYNp3xwOfFTT7CAAzAAAzAQOcxcO/efbdm3QY3ftJ0N2DwSPfMCy+5wSNed9NmznPf7fre/frrr458Dzffd+3Z555+/sXUz5969nf79h8kD/8abh525f2FYVO4qjMRRoHWK4Bh0z1fEF358iFsmIIBGIABGMiLgQcPHrp132xyE6fOdAOHvuqe7/uyGzpyrJsxe75TZbhIhoXi6n9qabR+w2bXo9cA9+89eqd++g96xR09fpIKf4AV/rt377neA4am5p3la7+XR7j79x8UNg99pkNYr3VfhbQfw6b1dV+uiAKFUwDDhkJ1SC8u4gKPMAADMAADxsCGTduiFiVWsU1aqtXJ8ZOngqvsLv3oU7ft251l8Zo0bVZZ5f3yj1fK9lu6Vemdt+C9smOT0m7b/vhsX7dx87bEsCxMlq2/r2a//W7mPJy/cElh80+thIzFdi8VlyKxjmFTuKozEUaB1iuAYdP6F3iRXiTEFT5gAAZgAAZazYAMi/nvvp+5EvjUc/3c5q3fBlNRk1mjiqu6L124eKkUrxMn/1KWJhlScW2VdrUeqrfiK9OGljbh3Ktq/VVvHha1axSGTePcYdi0vu7LFVGgcApg2DT+kI0XsviOlmkMXLx02Q0dOcapQP3zzz9XFNDTzmN7cZnSmAXK72Y+CqPTGHjmhQENa6JzO00POKm8x2VYzJy7oO7Krkyb4yfa39LGzBqrrA8bNdY9+umnEruT3nzcykYtMHymq5k1I1+f6D79YmVkTC1d/qnrN3B4hUbqHqUw/DDbsZ4H11mfnSE8J2XEjR43uezZ9h/P9KnIH2Mibalz/HQrzCNHj7c9P2sxJMNG8RZ77fwoDrSwSekbaBW+wtVUiTAKoICz+7fWwzjP/aqw/vTTT4mfX375JfgXU55aWFhKd5omadt//rl7amWaFWWpX9me6z0wKsyokKb8LErciWdlZTKrJio4phXKs25XGFmvV5TjVLnKmv74cSFUzPLWGU7K7zFV9tLMmhGjJ7gVn33l1Crl/WUfuz4vDatgqf+gkW01LOJmjTGs1kLGjrpv2XaNXWLbf/vtN/fWnEqjSpX4z79a7bTfjtVSgxFPmT6nFJaFqYGI/ePasZ4H15aeWssQnpOvj59SkQ+14p11//BXx7c9P2sxZIaNHRcv59faHi/n2vH+dv/HrrTtYgHDBsOG6j0KdJwC7TBsahXYVbnVwIJ6AU6f9bZbuWa9u3P3bvAvLHvBNLJ88eURdb/s3y5If2e9ZJcsW+F69h0UDRa5ZOmKbtXKZMHipVHlYtrMt6M8xrD5vYKmSsvI1ya6s+fON3Rvnzt/IfpF89Dhow2d38h9Ws85eVRYQqiI1JPmLMfWev5Xq8Rg2CQPPNtJnMyatzDxXaiWJfGWIxrQNT4mjPjZuXtv254JGrNG3aCSON66/btSvN6YOrN0jI1jo7JO/DzlbbWuXjJt4i1tNHtUlnuxK4/J4/kX1yLtewj8yyRIi18e2+Psd2XeNRJ23LCJ57+FGddJ6VIZMa6Rtmmfv903Yvztfv5r3T/OrhvystBdolasWOE+/PDD1M8XX3zhdu7c6S5fvtxxFegiJWjNmjVRHl24cKFI0SaungIhGjb+g9jWn36+n5s1d6G7fuNm2wsieT/4z567UPZSsjTXWu7+fl8htJBZE0/Lhys+K0Tc88hr+1VUhWjp4P9KlEf4RQvj4cOH7r2ly501F1d3gXo00bH6lV3dH6SnzE5VWkLTIV5gjd8DWb77BdHQ0tdofDBsyluUwMljPb5eta7iXaH7ZO36jan3991791zfWNcgmeON8pnHeeoCq+da/B5Xlz4bz0Zdt2y/BgvWdnum2XY9I+ODFifFT92j7BwtNeV30nGt3JYH136aqq2H8JyMGxFJ8R37xjS3/8Ahd+fOXXf79p1ofdyk6WV5l3SetmHY9C4zYnyd/PzXOoZNC1vYPPPMM+6Pf/xjps+sWbPcgwcPvCooq61SYPjw4VEefffdd626JNfJWYGiGDb2cFaT6IcPH7W9MJJnweerVWszvbBNAy179OzvHj0qhg5qWePHXet+M/A8Cnb+CzvPvMkzrDTDprukX1oeOXbCqctCnIcPPvw40z195uy5qDISPz8+DkSe+UZYjyvUaIEWXcXAufMXS91G/fu7mlljcQnRsNCYNUmDJms6chvPZuKUt6Jn4dz5i92t23dKJrbSL7Nm05btmZ6LaoHja6YWPqZNu5Z5vNf8NFVbD+H9X8uw+ejjzyu6tClv9IPO8k++KMu/pLRi2GDYVFT/nnjiCffkk09mvtmtwlcRUBMbzLCZMGGC+/zzz8s+H3/8sZs3b54bMGBAydB57bXX3P/93/81cUVObUQBDJtGVAvrHLt/W/lSb+YXVr3IOq1ypl9dkl7Q1bZNnTE38zO6lXmbdK3n+75ckT414bZj8yjYhVBgs/SkLbu7YXP6zFn3bO/krgKqnNQaWPHHK1dd7/5DKliy+ySEcRvS8p7tGB0wUJ2Bxe9/VHFvZzFrpGuIhoXlt7pBqWWNPae0tOmbjx0/GW1XK0Ed74+Dsn7D5tI70sJKW6q7mB++pjlPO7ZV2/N4r/tpqrYewvu/mmEzZuKbiWaN5YVMGz/vk9KKYYNhU1F7DMmw+eqrryriZxv+/ve/u2XLlpVMm23bttkuli1SAMOmRUJ34WVCMWz0C/snn38dfTSYoLo/9exX2TJDLzIVfqybib3wirxUFw9/ALVBw18rK3wpzWpZ4B8T+svbzw+NWRMvgCxb/rhLlNKfx8e/ZojraYZNHmlXGCGm2eJ05eo112dA5QChxsWiJR9WbTGm5uMvDxtdwZGdr3EvQuwWZelnWb2yjj7oE3/f+2aNugtt37HLqTtlEiufxQwLteJLOq6rt+m9rDF1NGOQfy3FXy1r7Hml5ZbtO6JjJkyZEW2XIW1dwlav/absfD+s+LrKQpo9yg97/KTpmc+Ph5fXdwybx+NN/XDgUM382LN3f1ke+vmpdbGl97x+8Kz1ea7PwJrXyyufLRwZVr5xFi/X2HFdvV1xoEtUG7pEVTNsVIf9xz/+4QYOHBiZNu+8804XVmsJOkkBDJskVYq1LRTD5vr1GxUvGD3Y02aLsH7g9hLolOWlyz9WvLRVUS1y+pSPGrNG3aDUskbN17vjDFcaQFuFCelR5PysN+4aMDzJhFQhVC1u9v1wsKoe6vo3aswbFfeFztfYVqrI1RunVhyvAnYrP61IUz3XaGXada164taKY7t7+uvRWGN6+BVUM2tkRix8b1lpn1pr3r//oCyvdUz8+dAuw0J5bunQ1N0aWN10iLpILVxS2m/j2Rz9ZysbdX+6eOlH9+XXa0rn2LnVlpo9yq5pyzXrNtQVRrXwG90nU0Hvu1Z8dK1G45nXedVa2OgHh1rXuXb9RkU+Wn5qKbZUdvC3pa23w7Aww6bVz7349TBsUswaAWgVvjyrqdYlqpZho2tqDBuNd6NuUfG///qv/3JqefPee++5adOmRZ+FCxdGAxb/7W9/ix/uDh8+7NavX+9+/PHHaJ+m2l29erWbM2dOtM8/QePmaJ/Cmzp1qnvrrbfcBx984I4ePer+93//1z+0bF1xOnHihPv666+jc5YvX+4OHjwYmU+3b9+Orr93797SOYJRcdq6dWtpm85fvHixmz9/fmmbVtQt7NChQ1HLI+mieKn7mM5PGufn/v370b5NmzZF4egY6bVkyZIobtL/yJEjUdzKLvTPL75ho2srHYsWLYquq6WuK0b4C1cBu39rvUzy3K+Xa/xFk2TY6Jo3bt6sOFbndmr3B/uFzddHBkee+hMWv2a3kgFVXHyebV3doPbuO1CT7XkL3ks8X+FkHeOhlem1a6ngaGnt6qWuZdcNZUn6u3f+18OhukvaPVJm1ixeWtpu+7/ZtLWM9S9XVo4Bt3pd9hYq9cSz1rEqr1s8banZoDTAsJ2rljXWRSoaz+bRIzdh8gw3953FpWPs2FrLP3+zuWzcG12zR68BtDasUmetpWmj+6sZNllmOU0r6xpHYit0w8bi2u5lOwyrRrnReYWeJaoew2b69OmRYTNu3LiyWvGxY8dcr169Sl2m4oMYDxs2LGpe6Z8kY0bHbd68OTKi+vTpUzp/y5YtpUNl1PzpT38q7YuHrXDU+if+d+/ePWcmR9I5+/bti8LU2D32d/369Whb3759IyNIRoid269fPzvMyXwZOnRoaZ8dY8vnn3/enT59unS8Vk6ePBkdr33Xrl1zL774YuL50lbdMeJ/lhaZSZMnT048Vy2grly5Ej+V74EoELpho1/P4jMn6GVw4OCRugs3zTxQW3Xu6HGTKwp8fmGvVfHgOvmbOnqGiufupO2evT9U8GyFua9Xr6uphX6hlrFj5/jLDz76pOb57dQaw6J7GxbdPf/rufeuXrsW3eO+WfPukscta/z7XoMTW9gyb+LPBw3Ir5mj7JhWLpMMG4v7xKkzncasUXx+7yI1Jkrz2wuX/HMw9lfqinOSWaNr1TP2TSu16fRrVTNs9h88XDNv9eOFsZK0xLB53MUsSR9/G4ZNimNpFb48659ZDRu1kpGRIVNCRob93bhxw8mE0PaxY8e6lStXRq1aTp065TQluJktaqXi/5lhs2rVqpJ50b9//8iM0Ln62717d8mY0PEbN250Z86ciVqiqMWLGSQ6zv9T6xkzRGRiyPRRSxnNsDRz5szovJdffjlaphk2mkZb4UufUaNGRS2HdI3/+Z//KRlBgwYNchqY+cCBA+7s2bNORpPSoPMGDx7sR6lk2EiP3r17u+eeey46Vy1l9FE4zz77bHSuBnlWZcP/M8PG4q3WRnv27IlaGSk/LA8mTZrkn8Z6FQWSZhXwH0TV1nVuvX92/7byZVpPC5tz55OnvL5y5WrNF2Ar05THtW7eulVR+NS4H92tkp+HliGFsWPnbjdw6KtRYUzjNKgJe0jx66q4iFtLd/y59cprEzJpkGRgKqz+g14JfprT7l5hJ/3d27Cq9lzRs+HmzVvu5KnT7vKPV6Lxq9Z9s6n0TFj0/oeJlVd/Nrkks0bPhnXrH4dTLQ5dtU/p2bBpWzQ5groBx599GrNG3aDU1VNmjfZv2bbDqRtX1nJNmlmj1ohdlS7Crf4jTjXDRnlbrRynfbUmnwjdsFH8QvoUideOb2Gjh50ZHTIj9u/fX6qryqDRtjFjxiS2dLH9amXj/5lh88ILL0Tmhd+qxo6zliQyM5L+bP/775dXnmVmKE66puIe/1PXKO3XJ8mwkUkj82TixIlRaxr/fBlGOk8GSVLYtl/H+C1lrIWNtqs10oULF/xgo/Xz58+XWippxi7/zwwbnb9z505/V7S+YcOGUpo0WBx/tRXQ2B69BwyteMnHX/rx7zpH59b7F7Jhc/HS5YrB9JTuMROmdmSh5JuNWyryfcHipR2Z1iK9TJuNqwrR6ha0/btdzqZx1VgFzYYb+vlqBRd/Ttn3bd/urJn+NLNWYaxc83t325A1ULcHFeJb8dG1QtOC9Hfv/E/i8ey589GYNM/1Hlj2bPBNlqTZonTPL1m2osR4mlkzZ/6i0jFJ12/HNhk4Gzdvc5q6W7NB2TNQ3aCOHDsRzXCl2e/UMkazXdWK45o/byiFYWFpOWP2/KBMbHXf8SdKsPV4+tKO0/HaFz/ewvGXScfFz+vq79UMG+WPpu5OMm20bcWnXybmqZ+/ZtgkvU/iP4LqmK5Obzz8avno51Ur1kPgIa5Pte8dYdjIEJg9e3bZZ8aMGW706NGllh8yCzQ+jf/32WefuTfeeCNqveJvt3WZOzqvZ8+etilammGjfWmzTqkLlsK2cW7KAnCuNHOVxrSxP5koPXr0iK6pbk9Jf//93/8dtXLRtZMMG21Xy5ykrlYa80Zx+uijj5KCjh7iOl+fy5cvl47xDZtq4wVpvB2dK0PIH/vHDJvx48eXwvRXdNNYayYZP/xlU2Dn7r01H97+g1zrOqeRv1AMm3FvTHPq662PpkDUQLvxps5KpwYZrTX9b7UHY8j7NLtEPF9rDcgacnosbnoOqLDds+8gp0EjNWtU0V6olpZGlipo2XkaDFJ5rF+WbVunLjUmQ5xnfVerMV+TtPRrJrGk89Xl4cGD5Nli0sJie/Vfh9EHfbqSAVVKNdZMUqsr6wal67+3dHniPZ/FrJk2822ncSe7Mh2NhK04adya6zduRnHTbFAbt2yPxqxRS0G1vpBZ89acBU4tZ6pdY+XqPyfqE5pZozQk5bWe56qw+2lMO07Hap9/rM5NeifEj/PPadV6LcNG8dbU3ZoNSgMMa8wadYOq1bLG0lvtnal9dpyW7TBssqTfj2NXrrcj/c1w1hGGjZkMaUuZAZ988onTQL5Z/jQw7qVLl6KWNwozzbBR1yV1M6rnT8dr0GLrouUbNjY2jVrIVBuQ2ManSTNs1P2q3j+NbWOte5TmNMNGx6X9yXCyPPCNFzNsvvzyy7RTS3po8GL+sitQT9eoRrpCWUxCMWyyPLw1VWeWQUqbeXC261xVQGVG+TpoBp1OMDZU2PbTpXXNGtUurdt13YcPH7lho8a6Ia+MCbJikbcumhEsnu/6rilos1xr5GvlU9VaWOpmkOV8jsGEgIH2M6DK5Ky5CxOfBb5Zk/Se0D1fZLNGrZ7ffGtelHb9AKXZrDQLlFoPG5vqBqWWNeoS9ukXK0vbbb8tv/h6TaKGmkmzWmXezm/1Ms2I6c6Gjb3DGllWy2MMm/LxbTBs2jCGjVqzqFtS/LNr1y4n40CQVvu7efOm0wxICxYscK+//nrUzcmMh2qGzZtvvlkt2GifuhlpHBq1ABoxYkSpJYmF7xs269atiwwPDQpc7c+6aqUZNr5ZkhSOKnfSRrNVqeuUmUcWJy2TDBsZSbX+bDwav+uTGTbffvtt6ukWBwybVIkSd2TtGtVoVyi7aFEMGzUl/uHAocQmpa0uiHTF9TTOSfwlrl/cuuJarQ5TLWviafMr3WkFu/g51b6H8AtbNV1leuuXtF79Bruz5y6U5Wsnpv/+gwcVeW75l6VLo36Rt5lU7DxbFn2a+2qcsK/9BgN5kF8eqHWJWr7YvesvfbNGY9P4+2w9i1kzfdb8IA1wGRNJrWaVtmoDrsu0kXkjE8cf00Ymj1opvTp2UtT6WJVSX8PQuE17r2HYlJsLxnqtZREMmxDKYYoDhk0bDJtq3XSswpm0VGFPXaeeeuqpyChRSxyZJTKA1F1KJk41w0bTgKf9yfDQgL9mgmigXn2fO3duNI21xq7RPt+w0TW1beTIkWnBRts12LGOSzNs0saBUcshjaljgzUr3eo+pcF+ly5d6jRjlsU3ybCRqVLrzwYu1lTd9meGjQZOTvuzmbYwbNIUSt+epWtUo12h7KpFMWzsZTZ4xOtlhZjQCimNxmfWvMpfILfv2FVWsW807Hafp25Qln+2VOsLi1dawc6OzbIMoaBg6YkvVUDVeAV9XhrmNC5LfH8npt+fpjeefzJiRoye4DSg8PyFS0pdBXxdNCBp/Dz7rv760fljJzvdNxojwj+X9fwq3GiJlo0yoB8Qp0yfk3gf+0aDZnuze9tf1jJr1GLlsy9XBfkjjuog1rLGT5PW/fF6krSVWaMfa9RNSt2l1G1K3Us3bdnu1J1K56g7TejPvbT3GoYNhk0S93ltE3cYNgUybGRUyKBQ1yZ1R4p3mdLsTNqf1iUqbUBhvYBspie12NEsTPEuThqYV2H7ho3Gw9E2mRfV/mQU6bg0wyaeDgvLWuZonJy1a9eWDSysYzTujcLVJ8mwkcHz97//3YKrWCqNTz/9dHS+P7gzhk2FVLlvqNY1qpmuUBbRUAybqTPmRs2m1XRav8jpV6T4wIRW8Ok7cLi7d+9+x1TS1JrquT7lgzCqe9T9+w86Io0as8byzpYan8Re0Hqu5vGx8EJbim2lW4NOfvL519Hn4OGjHZ3+M2fPVeS55X18KQNn9dpvSnoo/27dup35fN0rGtAxtHxXumQuNfNRGKGlq9n46FnXqCY6t9nrh3Z+J3IiwyJLy5qlyz9NvM99s0YzLvnj2alcsHDxUnf6zLlgWVALmvhzTt/jz7kkFtWyRmaNBiLWugYmluFv4am1sd4lGsg4ZNMm7Z0eT3PacbY96/Hx41r9XePTWB7lvRz+6viqrIfSJcr/4Sz+XLP8iD//FXfldfydoG3aF9+e9N1/T2LYpJg1ygCr8FkFMI+ltRRppIWNP97K0aNHE6NTa9DhNMPm+++/j0wLtdj5z//8z8SwP/zww+gY37DRlOBmmFy5ciXxPJkimjq7EcNGrYd0nsbzSfrTy9Oun2TYaJ8GIE7782eZunr1aukwDJuSFF22ktY1qtmuUBZhu3/tYdqKpR648Rfa9es3Kl5IalGmCm78WH3X4HutiGsrrqGuXvE0avDlVly7FdfQi1dj1qgblFrWqJAurltx7RCu8dKQUdFAuxps1z5q2h5C3LoqDhcuXqpgOs64/10VslOnz5Q0kSHr78+yHtoA3Wm/MGdJix3jF4C7Kq9aHW7S89/SW2upc1sd366+XidyoudbUl76LWs++vjzxGN8s2b1um+iypyMCQ3UrpZ3Ks92dZ40E/6t23cqxqOTFl+tyvbMVzcotayRWaPzNPW36jVHZdxMeWzcmL56r85++91oKvGQDZxmNC3CuSdO/iVqNar7Oc+PWqLWmmgjRMMm/lyzPFTrF2NXSzNs/G1aN8Mmvj3pu65l4WudFjYppo1V+KwCmMeyGcPGWs/IhFDTu6S/efPmRQZGvS1svvjii+i8+HTgdg21gBk0aFB0jG/YaEBidVFSnN599107vGypbkVmqtTTwkatZ6zrlwylpD+NAWRhpxk2U6dOTTo12qbuXjpfxpDfogjDJlWyXHckdY1qtiuURdDuX3vYtWKZVGBPMmwsLmoeHH9I6yVm+4u+XPjesor06Re2oqeL+Hff7hQaRDteYIvfw/Hv/phNqpT17Fc59lH8HP+7ZpcLibl60++nxdb9gmhIaWsmLknPf0tvrSWGTXJ3ipA4uXnrlnvqufIB9JWvvlkjY8FvNWP57ps1GpxX2zWjTjO8tfrcpMGB/RalWeKjblBqWSOzRhoMHTnGyQTXuceOn3QTp7xVUWYwDVUBznINjumc9zOGDYZNppveKnxWAcxj2Yxhc+/evZI5oe5B/p8MlRUrVpT2q5uPxn+xP5vWO62FjQbclXGh886dO2enRUtdV6aHGSOaZtv/8w2ZTz/9NPqVQPsVJw3aq1Y7NrBvPYaNwnj55Zej62rcHn/ab6Vtx44dZYMtnz59uhQtf1pvxVuDM/tdo2TOqNWOpSluCGHYlKTs8hW/a1QeXaEswnb/tvLlnZENPVkAACAASURBVFRgr2bYfLNpa0XhxB8DpZVxz/taqpiqi5cVtrRUQVZ91PO+FuG1t4AW4pSzXclE2ixPPuv++qDhr5UxP23m77Or+MdUWw+tuwyGTfL9lvT8r5av/j4Mm/ANm8+/Wl32PlP+fRab/chaj/h5m2TWaP+pvzxuedeVz6u8wlZ3bj9dmhWvXhNFY9aoG5Ra1sisUXjq9qHpwS2ex0+ccmqJ619L6/Vey8Jjmfy8KoIuGDYYNqUHQzVgrcJnFcA8ls0YNrq+Zkgyk0ED/cqIGTNmTDRmjVqjyISQQaJjxo4d69TlR3+1DBu12OnXr190nsLRdWbNmhUNJqzxY3r16uWWLVsW7ZepIwPHuk7JPFm+fHkpXjp/8ODBpXgonjbWTb2GjbqOWXrVrUpxmjx5cmm8nZkzZ7pXXnklOmbIkCHRrFtKrxk2miVq2rRp0X5pP27cuOh8M5AUtsbX8c0tnY9hE2HTkn/WNSqvrlAWabt/q93jee9LKrBXM2zWb9xSUSjp0bN/pudT3nHPOzw1o40XuFTgy/s6hNe+wpgGmRwwZFRkxA0c+qpTV4DukB+qgMXZrvY9brisWbehrvMV9qOffgpGWxWi8/h0GivNaoIeyVyFooumrvbv89fGT6noxqRZ5HS/23GaJcriby1rbF/Rfrzo9eLgUrqUhq9XrSulzdKYttTYN5oNauOW7VEY6galljUya0wPDdTuP+eOnzzlJr05q7Rf91da+K3crnKeTOtWfDrJyPX1ypou5bnxoWU7ugTpmoq7MRZ/zue1PR6ufbfwFYd2pN+u38jyX6xCVu/yiSeecE8++WRJ9FoXtwpfvdepdnyzho1+yVQ3HhsoV4aDDBIZDBpPRn8yNczkOHDgQLStlmGjg5RemT92rpaKrwwStbJRCxUbmFj79Au6/6dBkGXkvPDCC1EY6iqlli0ygzZv3hxtU9zs7/r166VrpQ06LCNFrXZ8g0XX1sxOGzZsiILSUhpou8bZ0Z8ZNjpPYatlkR+Gjlc3KLXSSfrDsElSpeu2qRtUXl2hLJZ2/9a6z/PcX69howH2/JeR1jVLTJ5xaldYHyb041eBtV3x4br5GzvKTxWyNXimprQWv0ePn+z4PD585FjFfRu/j/3vquj5/GksBw0o7B9TbV3dCPzzWc+fZTRF01oM9OpXblikjTcn02bbtzvLBs6NmzXPvPBShdlT6/rt3K/yfryr146dezI9l2Ts6/kmDTQblNY1Zo3Ss2XbjrLn4NCRY0tdpCy9+vFH04irAmvb2rlUxbna8zrPfb5R0M4053FtX5es6VKe++e1w7CIGzYag0b12kY/pqV/vsKstR3DJmX8GglnFT6rAIa0FMQXLlxw58+fr5gpSvHUAMAyWRr5u3//ftQyR4Pw+t2QFJa+65q6frW/+H4ZJjJU0rpkVQtL+2S6KD7q9iTTKv6ntGq/tZTxDRs7VuPtXLp0KUqbtQ6yfSw7TwG7f+0h2IplVsNGhR81nY4XgPRiUgW4FXHt6mtomnL/Rat166ve1dduVfh6yaq1Rc++g5ym+NasUf6Lt1XxCOE6a/78e6uRojXzb1S7pOnq47zb90VLPqy4p1d8+mXF/WHHx5fTZ71dcX6j8eY8jAkYqJ+BZgyLuFmj+3vBog8Kd09rFif/2aSJE2qxpNmj7Bwzri0cjVmj81XmsWO0VKubrdu/qxl2rWt31X4Mm2z3j2aM1CDTKh/JoPTzuJphs//gYTdu0vSoTPVs7/LzQjBsms1/lRGrGVFpOmHYFNSwCal6rW5LmvL7zp07idGSUaIWMTJs1DWqFX9Jhk0rrss1wlEgFMNG03R+8NEn0UcVeg1AOmj46LKXl/+AVpPhripotCpcNX3206T1+DgerYpLV14nqWuMZo3qymuGFvaqteujX0tVCF+5Zn23SbsGIJVJF+c8/l3dCHRsPN/065q6kcWPj3/v0WuAu3jpx4rz4+HxPVslAp3QqVEGzGiwezSLYZFk1uiHmtNnzhbunp4YG1em/6CRTq2J0vTU7FGmlZZK9/UbN6Opu/VdAwzrXHWDUssa/1itv7Po/bIuUmnXafX2Zivs8XRW+17N2Gh1uuu5nsZ2SvpB0tKalq6PP/uqggM7R8usXanqiWutY+MtbJrNfwybDPXEELpEZYhm4Q6ZMmVKZMbMnz+/bKYlJUQtXmzsm759+7q//e1vLUkfhk1LZA76IqEYNv7Lpta6mgnrl7xaL5DQ9r/5Vn2DqEoHdaEJLR31xke/HMXzVFORWjjNvtgVdlrBxq7R7uWnX6x0r7w2ITIvZsyeHxXILU6dnn4ZKSNGj69gwJiQWbP/wKESD6aLLWXkaABOOz6+1K+L3363O/V8C6fVyzzyNZ7WtO8h8k/6u2eXkPgMRgMGj3SaNS7t/ksya8R5fKDitPND265WL/H7VO/+uGmj1gOaPSp+rL4rjI2bt5X2aYBhpTM+no2dO2zU2Gjsm5C06O73f628OHTkWFWzRnmb9Fw/cPBIzfMwbIo1xmWhx7AJuobbYOSOHTsWjXWjFjQaYHjVqlVOs05pqnB/TJxWta5RMjBsGszMDjqtaIZNn5eGuVu376QW/mq9JNu1X7M9aKBkK2BlXX65cm3h0hrXOKmFhT/LVx4Fu6SCTTweIXzfs/eHiIHln3xRytfukH79WqbpbjU4pgwaNefX7CnvL/vY3b17r6RFWh7JoNUYD6r4yOxTgXT4qHFuweKlwc6olke+Zn1OhMg/6e+eho1mMopzq+6KDx+WmzYyLPQcjB+r7zq+iD/K6PmlZ53KKfF0qaWNWhtpTBsNRKznX/wYfdczTkMaaOpz26/ZoOzZmKSvjlN3Go0JZMe1e9nd7/9a+sdbYlle+8uk57q6T/nHJK1j2GDYJD4IrMLXQXXYLkuKBjwePXp01NJGxo3/0dTcMnVa+Ydh00q1w7yW3b+1Xi557tfLJOklU23bU8/1cxrjIqnbRJ5x66qwdu3ZV3eapce58xcTn7tdFc+uCFdd3OJ5q18W7Voq4ObxsfBCWqpSogEjNdOJmrlrNhRpsXT5p90i/Wl50WxlrNnz0+KV5/buXmEh/d3TsFE3xj4DKg2Ll4aMcp99ucrt2rPXqYtofPpre0dMm/l2ZFjkeS+2OiwNuN4I/xo0WDOCWnxlTpsumg3Kts9/9/3SdtsfvVc+evxesWPbtWwk/X5a6lnXtdqVzkav+0L/IYl56Kc7KV1JLZb9c7QegmHTbJnOdI2HU2u7NGvHGD4Wr0aWtLAJs34cxUozP+3fv99t3brVHTlyxN2+fbti4OJWRF8zWmkgYg2gzF/3VKAdho1+XddDtdqnZ79B0S9QGstGv8Jp1oRGHoShnKMBA6ulN2mfCrihxL+ZeOiFqzFrVPhUyxqZFX6htJmwQz9XaZfZaAUq9VcfPXZyYY3H0PUOKX4qNCfd112xrR0F9Fpak/7um/+HDh+N2LfnXtZlJ5g1dl+s37ilLg3UskZml52v5ey33y29O9Q60fZpPBt1g/J1XRqQWaN4dvf73/IqbRmf/t3PS1vXeFDx87MYNgPaUHa0MWz0I1U7P3q/YtikDDxsFb7uWd0l1ShQbAXs/o2/FPjOoJMwkA8DMm1OnT7jdn+/z925c7eiAIbO+eiMjugIA+EwsO6bTXUZFnPmLyp8y5o4f2ppk9Q9yirkWj79fD/39ep1iV3ANmx6PI6NjtXU3XaN38ez+X12oNDMGosjy/T7MUuXqKkz5pTy27TM0iVKxqcd36qlTBKf63auY9hg2BS7Zk7sUSBBAQyb9Bdqq150XIc8gAEYgAEY6DQG1NImqXuUX5lT5Wrt+o0tr2C2SmsZ9hpEWBV0tZhQK0u1rlCXMI3rVW1MPn8cG2mmLlN+vBUuZk0xnxu1Bh0WJ0ePnSjLb+X9gUPVBx3WeTZItc9KV69j2DTOIV2iEiqnbEIBFChXAMOm8YdsV78ACZ+8gQEYgAEYKDIDMiy279jlpkyf4wYNH+169BoQGReaAXHl6j+7O3e7V6vDesffincvKTILxL38WaZJJWSw+Aam1rVNZl6aXp9/tTr1PA1onXZeV26Pc9ru712Z1rzDxrApr5fyDQVQIEEBDJvyF2jeD2LCQ18YgAEYgAEYgAEYgIE4AxpMWl2YNO6MZhLTWEZJLWvi5x07ftJNmznPDRg8MjpP69oWP47v4TOHYZNQOWUTCqBAuQIYNuE/zHnhkkcwAAMwAAMwAAMwAAMw0FkMYNiU10v5hgIokKAAhk1nPfh5kZOfMAADMAADMAADMAADMBA+Axg2CZVTNqEACpQrgGET/sOcFy55BAMwAAMwAAMwAAMwAAOdxQCGTXm9lG8ogAIJCmDYdNaDnxc5+QkDMAADMAADMAADMAAD4TPQcsPGKn4sLzo0QIOiMcBDPfyHOnlEHsEADMAADMAADMAADMBAZzCAYXMR06BopgHxbR+zPPg748FPPpKPMAADMAADMAADMAADMBA+Ay0zbIAhfBjII/IIBmAABmAABmAABmAABmAABmAABsJgAMPmr2FkBDcE+QADMAADMAADMAADMAADMAADMAADMGAMYNhg2DiDgSUPBhiAARiAARiAARiAARiAARiAARgIgwEMGwwbDBsYgAEYgAEYgAEYgAEYgAEYgAEYgIHAGMCwCSxDcDLDcDLJB/IBBmAABmAABmAABmAABmAABmCgnQxg2GDY4KLCAAzAAAzAAAzAAAzAAAzAAAzAAAwExgCGTWAZ0k73jmvjHsMADMAADMAADMAADMAADMAADMBAGAxg2GDY4KLCAAzAAAzAAAzAAAzAAAzAAAzAAAwExgCGTWAZgpMZhpNJPpAPMAADMAADMAADMAADMAADMAAD7WQAwwbDBhcVBmAABmAABmAABmAABmAABmAABmAgMAYwbALLkHa6d1wb9xgGYAAGYAAGYAAGYAAGYAAGYAAGwmAAwwbDBhcVBmAABmAABmAABmAABmAABmAABmAgMAYwbALLEJzMMJxM8oF8gAEYgAEYgAEYgAEYgAEYgAEYaCcDGDYYNrioMAADMAADMAADMAADMAADMAADMAADgTGAYRNYhrTTvePauMcwAAMwAAMwAAMwAAMwAAMwAAMwEAYDGDYYNrioMAADMAADMAADMAADMAADMAADMAADgTGAYRNYhuBkhuFkkg/kAwzAAAzAAAzAAAzAAAzAAAzAQDsZwLDBsMFFhQEYgAEYgAEYgAEYgAEYgAEYgAEYCIwBDJvAMqSd7h3Xxj2GARiAARiAARiAARiAARiAARiAgTAYwLDBsMFFhQEYgAEYgAEYgAEYgAEYgAEYgAEYCIwBDJvAMgQnMwwnk3wgH2AABmAABmAABmAABmAABmAABtrJAIYNhg0uKgzAAAzAAAzAAAzAAAzAAAzAAAzAQGAMYNgEliHtdO+4Nu4xDMAADMAADMAADMAADMAADMAADITBAIYNhg0uKgzAAAzAAAzAAAzAAAzAAAzAAAzAQGAMYNgEliE4mWE4meQD+QADMAADMAADMAADMAADMAADMNBOBjBsMGxwUWEABmAABmAABmAABmAABmAABmAABgJjAMMmsAxpp3vHtXGPYQAGYAAGYAAGYAAGYAAGYAAGYCAMBjBsMGxwUWEgdwZ+++039+uvv9b88CII40VAPpAPMAADMAADMAADMAADMBAeAxg2VNZzr6xzo4d3o7cyT06fOeueeeEl9+89elf9PP38i+7I0ePwxzMIBmCg8Aw8evSTO3DwcOHT0cp3ha4lzaRdq6/L9bp3OYX8J/9hAAaKxACGDQVlCkowkBsDV69dc30GDKtq1PhGTs9+g9zFS5dzu34RHr737z9w585fdD/9RCWlCPlFHCnU1WLg8o9X3JZtO9yGTVu71bOsli5Z9kszaffjj1fQjrIIDMAADMAADCQwgGGTIEqWQgbHUIiHgXIG7t675waPeL3CrBn3xjR34uRfoo/WfcNG6wOGjHK3bt/p+Af01WvX3cSpM0vp/+Ozfd2CxUvdgwcPOz7tnXSvqGWY8i7po32W1mrHJZ2btM0Pz8Jt9zLvdFULL8T0+/rLdN1/8LD7ZuOW6INhU/5O8LVKW5dmpp+07AQjW4b88k++cG/NeceNGvOG6/Xi4Ogz8vWJ0Tbt0zFpmrC9fo7QDM1gAAY6mQEMGwybjik0qKDnfzr5xm1n2pI0/vnnn92YCVNLZoRvypw9d77EmNb9fbauQu0jr8WJXUPhtjOteV37/IWLrnf/IYlpHzF6grt7915HpFN6Kc9OnjrttmzfEVVaZsye74aPGudGjB7vZs5d4FZ89pXbuv276Jiff/6lcOl+5oUB7k89+yd+tM+YkQFjfDe6VBgWXijLvNOVVc9Q0m/xuHLlatQyxMwGLTFs6q8w+IaNNFRrG2lrOhdlqXHbvtv1vRub8KNE2v2vY3fs3BON9VaUdBLP+hlHMzSDARholgEMGwybwhWMkqA/fuJUReXo2PGTHZG2pPS2Y9uBg0fcsFFjSzrPW/BepK8KqvolMa1Qeu78hVI+aD3tuGkz5zmFpbQpbDtO19S125HmPK7pmzUDh77qtu/Y5S5cvOQ++PBj9x/P9InS2SmmzZ69P7gBg0eW8s7yMG0pPfb+cKCweVuNj7yNjWrXauW+Tk1XVg1/+vlnd/Dw0VKrEAyb5griccPG9JTG0jprvrTzOLUQnTB5RubnXvx5qHO7QyvTduYR127uPkU/9IOB9jKAYYNhU4gCUa0HxbtLllUUlhYs+qAj0lYr7a3aP/zV8SWNn3quX9SSQtd+f9nHpe3xgqi+j5803Z06fSb6aD3pGNu2ZOmKKM/USkPXsO1qndGqdOZ5Hd+seXnYaHf9xs2ydPz5m80dYdr8eOWqmzx9dim/LN+yLqdMn+M0Dkie2rc7rE41Njo1XVl4uXr1WtQ6zEyF+JIWNvUXaNMMG2mrlngaFy1L3rTrmKPHT7p+A4c3/OyzZ6TCUFjtSgfXrZ9dNEMzGICBVjGAYYNhU/gCgrpV9Oo3uKLA9FyfgR3RH75VD4Nq19EU3Vaw1FJdQux4f3se6xauruGHpzjYviIsfbNm0PDR7sbNcrPG0lB00+b7ffsjHvy88tfVikgtafSxFkX+flvXeCUKy3QJfanWYEuW/W4whh7XIsVPmlpLu1DiLQP50JFjia1q4qZN1u+bt37rdu7e6/YfOOzOnrtQMsBDSXM98ZA+SoPGoFGalLasOmQ5TtrrGvXEqRXHymDxf1iwZ1mjS4WFaUMFsBXscg04g4FiMYBhg2ETXCGo3ofI7u/3lSr2fQcOd/0HPe6Ssf27XYVPX716dMXxGDb1PdjLzZrXUs0ayyvftNHAlCFWTiyu/lJjEiVN4f5s75fc6rXfOO3XeER2jta1Tft0TLxio/FMNC28HR/qUunQ2DyKf6hxLGq8pKm09blpZ1quXb/htn37Xa4GRJJJsXHzdnfk6HH36NGjwjCluCrOintSmvLcpjxQXrSTBf/a6sJUq2XNmIlvug8//jzSZt8PB6PxeTSGV/9Br1Q8++xZqDDpHlXf+9bPF9bRDgZgoBMZwLDBsAmmANToDWYVJxV4Fi5e6j5c8VmpMDTpzVmFT1+juuR5XjXDRuZCnh+Ld1Fb2MTNmps3b2ViUKaNFdrFsOkQ8lLmksXZlm9MnZmpYqXKl46182z5ymsTgmth4eeBBoh+3Rtg29/nr8t8UquhZj7+IMZ+2O1c7+p0GQfSOITBuDXdtAbCzdN8qBaWrpXWGq+d+R6/tuLYal1CmfpbLcCqjVkz++13nT92W1w7tQrWTFHGenypsENrZRZPA9+pFMMADMBA6xgohGGjF5cqjGkvMO2zT9oxaVCF8iteWvzYXv1muHfvflQhsgKPBjD1ZyLSeAtFKPyGns9xw0aVULvnumqpa1i+aqnrhK6Tb9ZoivObt7KZNZYum2HkpSGjgk/rrj17y/JHeaQ015NPOjZpKnjNtmKahLS8cvVaRXzj/Ft8O3Wsl7zTFdfPv+fFhjQ3Tdu1VDnBn767muGiMVmyfGqFoWdJu9Jb67qKW7WxZ5S2LBrUCsM0Cm26b83s5HMaX1ermloaan+1wfpDfQZmSRfHVC+3og/6wAAM1MtAIQyb6bPejl6OaQOP+gVIjZHwQv8hTr/SrvnzhsTKw5mz56IZWvTrsM7tPWCo0zVWrV2fagrVKyzHt+Zm3LBpW6ngpF9+zYAbOnJMaftXq9ZmKjyRZ+l5pkpVvFDa6u+KQ8h51KxZo7TZr656jv3yS9hTXk+dMbeCib376p/xSefEWZo6Y05wef2X02ddnwHDKuLqx13vE2PUfy/5x9Sz7odn4bZ7mXe6aoUnzaV9u9Ot62tg7GqtSmRAZI2n3lXXb9xwZ86cczt27q5owaOwQvyxQXFKMlqUBqVFabL3cBYtksIyo0Zah9Kqxk+LGetp97K6e969d89duvyj++jjz6OWhCqTanKEBw8elhj54cCh1OeJruFfk/X08gnaoA0MwECnMxC8YXPn7l339PP9oo9ejufOV/7qpAKfKjiaaURdYPz+wbPmLix76en8nn0HRS9JDYI5fdb8qHl7j14D3MQpb5Ud2+mZ3wnpUx9xKzRpWmhL0+dfrS5tH/LKmNJ228+yvoc7hk11vXyzRrzdunW7buYePnzoNAaT8VxPpafVPMtMio9B8/r4KXWn2eKtcy3dWmpcHHUbsP3tXu7bfzBxrB4/zlr3DZZaRkT83KTvfnjt1sCun3e6soQnHpQHFod2LnVfprW2qcew8dOg5+vxE6fcN5u2lhk3W7Z/F9SYNhqzRnEyQyVabtoaxb1RQz3NsAmtVY3ll8qQSfdqfJtaSSYNsr5yzfoSx1evXa8aVlJ51+LBsvo7GX3QBwZgoJMYCN6wUSsZvQht6uCkpqYq8Pmz1iiDDh4+WnoR2gBumlJXA7rpJarxIvyMVGVJL09/G+th3+ya7tMvEG3asr2Uf1euXC3lv/g5eep0aV8783XO/EVl8YoX8qp917ntijuGTfq94Js1atllz5t68urhw0dujDcuijgI2bBJqrQ0M2OSzo2zH0plZeOW7ZERE49f0nffYNE9k8enHo5acWweaVIYFtcsho201nHKCzuv3cuk1jaNGjaWFo3rFDdtjhw7EUyaFZe4WdPsQMBxwybUVjWWR9YKMun+z7LNnwlv157HEyYknatr2XVZpr+D0QZtYAAGOp2B4A0bNSPVWBZqXqqWMWo9Ex+nJsmw0TGa6lkVehv001pdTJ42u1AvQVXcuvJTVMgtP1XQUT7fvn2nLF9f8361X/T+h2X72pVmxVFd9pIKZ9W26Zx4+lqZBlWwqsVP+3Sfyjht5BMfrybpWn4lr5Vpr3atcrNmbONmjddSzNIesmGjaXYtnrZcu35jw/eYzrVwbKlrVNO+Vfs0o5VvDFv8kpa+YaOBuBt5brcqXXldp5E0+rOgZTVslAfKi7zinUc4Srvf2qZZw0ZxOnHyL2WmiGZg8vXKI96NhKE4xGeDUlwbCcs/xzdsQm1V48e32rgzSc8Ef5sMGL/8uvC9ZRXPPf94Xcu/NutUSmEABmCgezIQpGFjv+CdPnMueplpPANtU6VbL7NDh4+W/XKpAp8qfHaeKrZWmR89bnJpuzW712Budqy/DPEmUCHJf4F3xXoIhcFGtPcHK5U5Ew9j3fpNJe169hsUTBeLrdu/K8Ura37qnHj6Wvld90mtuDbDURbOFYdWprnWtXyzZtiosQ0ZampZkzQegiqnIY9hs3N35YDDmra2lmZp+3VunC9dI+34Vm9XXHr07F8Rx3icfcMmqxERD6PVaWv2evH4Z/ler07SPiQe4ppZa5s8DJtff/vNqYzit2TRQPrxa7b6u+LgxykqR/32W9Pxkmaht6rxtU6aGa8W8+Jd2vnhqHVNrWfEqDFvlJ3jn89696y0ke/kOwx0TwaCM2yyVAxrvRwb2e8XIEO6GbJUZBtJr39OMxXtdml16vSZssrTlysrBxZW1xS/QLRzdzgzz9TTNaqdXaEsf7Pcl81wlIXzkAwb36wZPmpcQ2aNxoMY98a0Mo7tvnx52OigC+qHE1rYHD95quE461xLuy11DeMvhKXiWKt1nP8e8Z89lqYsyxDSWk8csqQpfkw9OknzZtiqJy3NHKvWNgcOHcmF2TMxc0SD0zYTtzzOVRx8w0ZxzCNcaSbt8girFWH0enFwxbMqzrf/XeZ73Gz8evW6srKJf7y/rmu1Ik1co3tWAMl38h0GisMAhk2P3tHL1y9AhgRwloqs/4JvZL2Zina7tFqytHzMCw3YqCm+459xk6aXClchzTyTtWtUu7tCWf5i2Dx+qGsg9D4v/T5bkMyaO3fu1l2ojswaj834fasWgqZ9iEu1KIjHeff3+xqOc9JYDrpGaGlXnGSm+WlPiyOGze/vVl8rW6/2vrVjtJTWIXKQlud5bb9x42aZORLCFM/xVj8hzmCVl/7VwqnXsPEnQ1B3qEVLfm8p7nOeto5h8/i9Wy1P2IdOMAADnc5AcIaNBFflcMfOPWWF4vgLTQPz6Th9VPjzu0Rpm36xsRlX9h84FB03YPDIKExVDuxcfxliZmPYVD6ElGeaij3ORK3v4qSRAWG7iossXaPa3RXK0i7Na+nbjPGXhXPFweLTzuWCRR9EWmiMLJk39cbl0U8/ufFVzJo3ps4sG+eg3vBbcbzSEOdhfazJfz3x0CDw8fB0jXrCaNWxynN/fKy062LYNGfYSONG7q+0/CjSdj0P/dYs/oD67UqH4uDHqZnnfbvSkMd16+0StWbdhtJzbPPWbyuec/Hnnv+dLlGV5b888pAw0BUGYKBoDARp2EhEtYbQi0tTbc+cu6D0mTx9drRdM6qY2CoYx2eJ0r53Fr0fHfvl12uiY2e//W70fcbsM9/DCwAADZJJREFU+aVzLYyQlyoYdeUn5LQnxS1pvAu/kFNtfdXax1NqJoXd6m3VukaF0BXK9Mhi2Mg0jX+e6zOw4l7Ttvhx+l4t37QvFMNm4NBXo7jql1LTJ+tSJsSEyTNS06rnXahGRTyNmr7cz7OPP/uqbj0szPjMKwrb9oW41A8Ceo8o/Wnx0zNbx9X7SQsv1O2NvpvS0iNNpa10Szum07dLU98cwbAJp3JR76DDe/b+UHoGLFy8tOyZ6T8/k9YZdDicfO/0Zw7pgzUYCJuBIA2bW7duR61mVLFTwcWHSE1KrTuCNZVOMmw0TbeNN7D9u11RGEeOHo9elqocauBiP1zWwwbVz59Z8xaWFXqU/9U+/gwvw18dH1S+p3WNCqUrlOmexbBJKnAmGanalnRsrW2hGDZiTXGdPqs+41cV0AlTOsOsEReffbGyLB9fHTup4Xsr/qu1wjb2Ql3qXfTBR5+kxlO85vEJLf15pKnavSxN/Zl0Qkt/K+JTiC5RN26mst8Kjdp1jbi5XOu91cx+pvUuTrm0XTxyXRiBge7BQJCGzco166OKwLwF7yUWCJYs+338khX//EXXKus6Xh/NumK/2I8YPb7sF+tF/5xpSudMnTHXrfj0S6fwVJF674PlidfjZgjnZnjw4KHr0WtAqaKoQVtr5Y/y2C80nTl7ruY5tcLMc39S16hQukJZOlXB8jXMut7Jhs1Tz/VzR4+dyMSSzJqJU2emalikljXGhAzzOAdXrlzNpIeFoeWlyz9WhGNmvH9c0dbN2ItrVM93hRFaujs1XSHpfOZs+YxM6tbd7vgpDn6rH8Wx3XFqx/XPnb9Y8byq556u51hdqx1p5JrhlHnJC/ICBmBADARp2GiKXL3U0gopJ0+djvb3HzQy+iUuXoBURUrdFvRLXVIf+G3f7nSaEtrOk7mjlhcaR4EbI+wbI94HfOOW7TXz7OKly2UFLBl0oeWz3zUqpK5QphOGzeP7wp4bekY988JLNU0bmTUalyatoF5Es8a4mPTmrLJ0ffL513XfW+pK5WszadqsusOw+IS09Dnx01fPusIIKU2KS6emKxSd9azVGH6+OXL23IW2c6A4+HFSHKu1lApFz66Ih34UzHofL1i8NBo4W9OiT5/1dubzdI2uiDthPn6XowVawAAMFIWBIA0bFQJqFQT8Y2zdllmbU6u71ZWr12peqyiZ2R3i6XcpUeuN+w8eZCrUaPA+K2D17j8kuDy3rlGhdYUypnRvmX71LDu5hY3pUM200TMmbmrYeVoW2awRG9eu33DP9R5YYuPp5/u5Eyf/kume1Pmnz5xzPbwucs/3fdldD7yrhQx+mRZJH+2ze6ZTjY2805VVT9O105ea8dA3RvSjxM8//1Liql3pVxwUFz9uimu74tPO69aaFMOe8frx0J9FMKlVoh0bX4YwM1g7NebaVKRhAAZg4DEDQRo2ZNDjDEKLx1qoIuePR6PBqLPqs3b9xlKlUgWjPXv3Zz436zWaPU7doELrCmVpwrB5zOEzLzzukmeF7CTTJjJrppW3QLHjtSy6WWNsxFu9vfjyiLJKih0XX969d8+9NGRU2X25fcfv443Fjw3pu/JfRmTSR/ssrtWOSzo3aZsfnoXb7mXe6aoWXojp70r9r1677jQDpm+KZO122ZXxsrAVFz9uiqvibPu7y1I/ClYbPN6e8yqv+NOfZ+1OpbCz/vDYXTQnnY/LIGiBFjDQ/RjAsPlr98v0ot7oX69eV1a527vvQOaCon7l0q9dVpCqd8DYomqWV7wxbB4/J/zWWsaTljJtZDjol2h1w+vkljVxrjSlt9/yYujIMe7CxUup9+e58xfcoOGjS/ej7k0ZP/Fw+f6YO7ToXC1++fVXd+z4yQqzRgb+o0fhzJaluChOcdNGcVcauhOjt27fcf0GDi89w/x3gb/+1pwFTt2h1JV/8rTfZzn198fXFabC7k5aktbOfbaRt+QtDOTDAIYNhk1hCgbDR40rFY7UdUgmQj0PApsqXgUkdd24e/deXefXc61OOxbD5vEDV90C4oVs/7uMG/97fL1TWtbEGd/9/b6y7k1qHaHxwuLHqcLnDxyuLlUHDh6pOC5+Ht8fM4gWxdfi0aNH7tq16+70mbPu2+92l5sgG7e4DZu2ups3bwV3XyhOiluZabNxS5QGpUVpUtq6A6NHj58s+yEo/qyv97uMa4XZHbQjjcV/hpGH5CEMtI4BDBsMGwoHMFCTAQyb8ofyjNnzq5oyaQX1TjBr/JY0aem07f6YLvZi1zbbX2upa9l5RVum6aRBqIuWlkbjq26BSXlc5HytpoW6scSNjEa+yxCp1kKtWhxasU9xSzJtGklr0bv+yGDJ0tIm6T7wtykMzJry92wrWOYaaA4DMFAEBjBsqKx3m8pDEW7IUOOIYVP+QpMeb815J7Ey6hfC/fVOMGvEZ5oR4afV1jFselcwgmHTO2Io1GddM/HKw7BRC7QQW9bEdVEcK7pHbdxSt2FVdMNGuqgLU5Yxbey5GF/qXLpBlb9j47zxHX1gAAa6MwMYNhg2GDYwUJOBRg0bFUxVafc/8cJq1u+KQ0gPa8Vn1ryFFRXypPR0ilkj/TFsshWa0nTCsMGwSWqJsmnLdqdBfUMas6bW81ZxVZwV96Q0ZdnWCYaNdFI6NLNTPVN+69juPD16Lb7Yn+1dg07oBAOdzwCGDZX1oCrBPHTCfOg0Y9gkGRiNbAvNsBGritPc+YurmjadZNYozTLfZEZk+STN8qNtWc7VMUktdIryjEjTSd2EipKGZuOptCbldZHztZomqrSrq1CWz5ZtO9yuPXvdgYOHnQbh/uWX9k/dXS1t1fYp7krDgUNHojQpbVk00DGdYtj4+mg2qOWffBG1wtQg9b1eHBx9Rr4+MdqmfTrGP4f1MMs+5Av5AgMwEAIDGDYYNkEUGhqpwLfynBBu1nbHYcToCVWNia7MD1273elPu74qHPPffT9RmzemznSPutGYJWkasZ0CDwzAAAzAAAzAAAzAAAzUzwCGDYZNEBXhrqzs5xE2D5e/uoOHj7p2mDa6pq4deh5oWmrFtUfP/m7IK2PclyvXduSvx6HnA/GrvyCAZmgGAzAAAzAAAzAAA2EygGGDYRNERTgPU6Urw+AB9vgBpm5Arfyg/WPt0QItYAAGYAAGYAAGYAAGYKD7MIBhg2GDYdOjciaXuPnDQ7H7PBTJa/IaBmAABmAABmAABmAABmAgBAYwbDBsMGwwbIJgIIQHInHgxQwDMAADMAADMAADMAADMBAKAxg2GDZBVNbjLVpC+x7KDUs8eHnAAAzAAAzAAAzAAAzAAAzAQPdgAMMGwyYIw4YHTvd44JDP5DMMwAAMwAAMwAAMwAAMwAAMZGMAwwbDBsMGBmAABmAABmAABmAABmAABmAABmAgMAYwbALLEJzGbE4jOqETDMAADMAADMAADMAADMAADMBAJzOAYYNhg4sKAzAAAzAAAzAAAzAAAzAAAzAAAzAQGAMYNoFlSCe7g6QN9xsGYAAGYAAGYAAGYAAGYAAGYAAGsjGAYYNhg4sKAzAAAzAAAzAAAzAAAzAAAzAAAzAQGAMYNoFlCE5jNqcRndAJBmAABmAABmAABmAABmAABmCgkxnAsMGwwUWFARiAARiAARiAARiAARiAARiAARgIjAEMm8AypJPdQdKG+w0DMAADMAADMAADMAADMAADMAAD2RjAsMGwwUWFARiAARiAARiAARiAARiAARiAARgIjAEMm8AyBKcxm9OITugEAzAAAzAAAzAAAzAAAzAAAzDQyQxg2GDY4KLCAAzAAAzAAAzAAAzAAAzAAAzAAAwExgCGTWAZ0snuIGnD/YYBGIABGIABGIABGIABGIABGICBbAxg2GDY4KLCAAzAAAzAAAzAAAzAAAzAAAzAAAwExkDDhs0f/vAH92//9m9kaGAZilOZzalEJ3SCARiAARiAARiAARiAARiAARgImYGGDZtevXq5J554AsMGwwYGYAAGYAAGYAAGYAAGYAAGYAAGYAAGcmagYcPm+PHjTq1sZNrwQQMYgAEYgAEYgAEYgAEYgAEYgAEYgAEYyI+Bhg0b55yTaUNm5JcZaImWMAADMAADMAADMAADMAADMAADMAADYqApw0amDX8ogAIogAIogAIogAIogAIogAIogAIogAL5KoBhk6+ehIYCKIACKIACKIACKIACKIACKIACKIACTSuAYdO0hASAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAvkqgGGTr56EhgIogAIogAIogAIogAIogAIogAIogAJNK4Bh07SEBIACKIACKIACKIACKIACKIACKIACKIAC+SqAYZOvnoSGAiiAAiiAAiiAAiiAAiiAAiiAAiiAAk0rgGHTtIQEgAIogAIogAIogAIogAIogAIogAIogAL5KoBhk6+ehIYCKIACKIACKIACKIACKIACKIACKIACTSuAYdO0hASAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAvkqgGGTr56EhgIogAIogAIogAIogAIogAIogAIogAJNK4Bh07SEBIACKIACKIACKIACKIACKIACKIACKIAC+SqAYZOvnoSGAiiAAiiAAiiAAiiAAiiAAiiAAiiAAk0r8P+yRlJkUQqhwgAAAABJRU5ErkJggg=='/%3E%3C/defs%3E%3C/svg%3E"
			{ ...props }
		/>
		<img
			className="edit-post-welcome-guide__image edit-post-welcome-guide__image__prm-r" // eslint-disable wpcalypso/jsx-classname-namespace
			alt=""
			src="data:image/svg+xml,%3Csvg fill='none' height='240' viewBox='0 0 312 240' width='312' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0h312v240h-312z' fill='%2300a0d2'/%3E%3Cpath d='m48 32c0-1.1046.8954-2 2-2h212c1.105 0 2 .8954 2 2v208h-216z' fill='%23fff'/%3E%3Cpath d='m60 38h191.455v34h-191.455z' fill='%23ddd'/%3E%3Cpath d='m151 49v11l5-4.125 5 4.125v-11h-5z' fill='%23000' stroke='%23000' stroke-width='1.5'/%3E%3Cpath d='m48 80h216v74h-216z' fill='%23e3e3e3'/%3E%3Crect height='16.5' rx='1.53571' stroke='%23000' stroke-width='1.5' width='16.5' x='147.75' y='108.75'/%3E%3Cpath d='m154 120v-6l5 3z' fill='%23000'/%3E%3Cpath d='m60 163h91.4727v49h-91.4727z' fill='%23ddd'/%3E%3Cpath d='m159.982 163h91.4727v49h-91.4727z' fill='%23ddd'/%3E%3Cg stroke='%23000' stroke-width='1.5'%3E%3Crect height='16.5' rx='1.25' width='16.5' x='97.75' y='179.75'/%3E%3Cpath d='m98 192 4.571-3.333 3.429 2.222 4-3.889 4 3.889' stroke-linejoin='round'/%3E%3Cpath d='m208.917 196v-15.111'/%3E%3Cpath d='m204.472 196v-15.111'/%3E%3Cpath d='m212.333 180.75h-8.889'/%3E%3Cpath d='m203.139 184.889v4.071c-1.928-.353-3.389-2.041-3.389-4.071s1.461-3.718 3.389-4.071z' fill='%23000'/%3E%3C/g%3E%3Cpath d='m60 220h191v20h-191z' fill='%23ddd'/%3E%3C/svg%3E"
			{ ...props }
		/>
	</>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);

export const InserterImage = ( props ) => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<>
		<img
			className="edit-post-welcome-guide__image edit-post-welcome-guide__image__prm-np" // eslint-disable wpcalypso/jsx-classname-namespace
			alt=""
			src="data:image/svg+xml,%3Csvg width='314' height='242' viewBox='0 0 314 242' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d)'%3E%3Cpath d='M272.893 40.3334H87.8808C86.6347 40.3334 85.6245 41.3455 85.6245 42.5939V198.572C85.6245 199.821 86.6347 200.833 87.8808 200.833H272.893C274.139 200.833 275.149 199.821 275.149 198.572V42.5939C275.149 41.3455 274.139 40.3334 272.893 40.3334Z' fill='white'/%3E%3C/g%3E%3Cpath d='M239.05 160.101H227.769C226.99 160.101 226.359 160.733 226.359 161.514V172.817C226.359 173.597 226.99 174.229 227.769 174.229H239.05C239.829 174.229 240.46 173.597 240.46 172.817V161.514C240.46 160.733 239.829 160.101 239.05 160.101Z' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M231.154 170.556V163.774L236.794 167.165L231.154 170.556Z' fill='%231E1E1E'/%3E%3Cpath d='M184.9 160.101H173.619C172.84 160.101 172.208 160.733 172.208 161.514V172.817C172.208 173.597 172.84 174.229 173.619 174.229H184.9C185.679 174.229 186.31 173.597 186.31 172.817V161.514C186.31 160.733 185.679 160.101 184.9 160.101Z' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M182.644 168.295L180.388 165.47L178.132 168.295V160.383H182.644V168.295Z' fill='%231E1E1E' stroke='%231E1E1E' stroke-width='1.11987'/%3E%3Cpath d='M125.109 175.36C129.626 175.36 133.288 171.691 133.288 167.165C133.288 162.64 129.626 158.971 125.109 158.971C120.592 158.971 116.93 162.64 116.93 167.165C116.93 171.691 120.592 175.36 125.109 175.36Z' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M123.419 166.432L128.44 163.058L126.806 168.402L121.779 171.74L123.419 166.432Z' fill='%231E1E1E'/%3E%3Cpath d='M246.946 99.3484H219.871V126.475H246.946V99.3484Z' fill='white'/%3E%3Cpath d='M241.277 106.304V116.738L237.372 120.65' stroke='%231E1E1E' stroke-width='1.93823'/%3E%3Cpath d='M241.275 106.304H234.767V112.825H241.275V106.304Z' fill='%231E1E1E'/%3E%3Cpath d='M230.863 106.304V116.738L226.958 120.65' stroke='%231E1E1E' stroke-width='1.93823'/%3E%3Cpath d='M230.863 106.304H224.355V112.825H230.863V106.304Z' fill='%231E1E1E'/%3E%3Cpath d='M184.9 105.847H173.619C172.84 105.847 172.208 106.48 172.208 107.26V118.563C172.208 119.343 172.84 119.976 173.619 119.976H184.9C185.679 119.976 186.31 119.343 186.31 118.563V107.26C186.31 106.48 185.679 105.847 184.9 105.847Z' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M172.49 117.433L176.695 114.724C177.096 114.466 177.616 114.488 177.993 114.78L179.857 116.221C180.293 116.558 180.909 116.53 181.313 116.155L186.028 111.781' stroke='%231E1E1E' stroke-width='1.6798' stroke-linecap='round' stroke-linejoin='bevel'/%3E%3Cpath d='M128.4 121.956V104.876' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M123.386 121.956V104.876' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M132.255 104.717H122.227' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M121.881 109.395V113.997C119.706 113.598 118.058 111.689 118.058 109.395C118.058 107.101 119.706 105.193 121.881 104.794V109.395Z' fill='%231E1E1E' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M72.0874 40.3351H40.4999C39.2538 40.3351 38.2437 41.3472 38.2437 42.5956V74.2435C38.2437 75.4919 39.2538 76.504 40.4999 76.504H72.0874C73.3334 76.504 74.3436 75.4919 74.3436 74.2435V42.5956C74.3436 41.3472 73.3334 40.3351 72.0874 40.3351Z' fill='black'/%3E%3Cpath d='M49.5261 58.702H61.9358M56.0128 52.7676V65.2008V52.7676Z' stroke='white' stroke-width='1.6798'/%3E%3Cpath d='M260.484 54.4618H100.291C99.3566 54.4618 98.599 55.2209 98.599 56.1572V78.7628C98.599 79.6991 99.3566 80.4582 100.291 80.4582H260.484C261.419 80.4582 262.177 79.6991 262.177 78.7628V56.1572C262.177 55.2209 261.419 54.4618 260.484 54.4618Z' stroke='%233E58E1' stroke-width='1.11987'/%3E%3Cpath d='M240.178 74.2422L244.691 70.2861' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cpath d='M248.639 72.264C251.598 72.264 253.997 69.8603 253.997 66.8952C253.997 63.9301 251.598 61.5264 248.639 61.5264C245.679 61.5264 243.28 63.9301 243.28 66.8952C243.28 69.8603 245.679 72.264 248.639 72.264Z' stroke='%231E1E1E' stroke-width='1.6798'/%3E%3Cdefs%3E%3Cfilter id='filter0_d' x='59.7077' y='17.0082' width='241.358' height='212.333' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'/%3E%3CfeOffset dy='2.59169'/%3E%3CfeGaussianBlur stdDeviation='12.9584'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.0980392 0 0 0 0 0.117647 0 0 0 0 0.137255 0 0 0 0.1 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A"
			{ ...props }
		/>
	</>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);

export const InserterIconImage = ( props ) => (
	<img
		alt={ __( 'inserter' ) }
		src="data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='18' height='18' rx='2' fill='%231E1E1E'/%3E%3Cpath d='M9.22727 4V14M4 8.77273H14' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E%0A"
		{ ...props }
	/>
);
