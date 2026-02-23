/* globals blinder */
import chroma from 'chroma-js';

export function colorBlindCheck(colors) {
    const types = ['deuteranopia', 'protanopia', 'tritanopia'];
    const invalid = [];
    for (let i = 0; i < types.length; i++) {
        if (!checkType(colors, types[i])) invalid.push(types[i]);
    }
    return invalid;
}

export function colorBlindSim(color, type) {
    return blinder[type](chroma(color).hex());
}

function checkType(colors, type) {
    let notok = 0;
    const ratioThreshold = 5;
    const smallestPerceivableDistance = 9;
    const k = colors.length;
    if (!k) {
        return true;
    }
    // compute distances between colors
    for (let a = 0; a < k; a++) {
        for (let b = a + 1; b < k; b++) {
            const colorA = chroma(colors[a]);
            const colorB = chroma(colors[b]);
            const distanceNorm = difference(colorA, colorB);
            if (distanceNorm < smallestPerceivableDistance) continue;
            const aSim = blinder[type](colorA.hex());
            const bSim = blinder[type](colorB.hex());
            const distanceSim = difference(aSim, bSim);
            const isNotOk =
                distanceNorm / distanceSim > ratioThreshold &&
                distanceSim < smallestPerceivableDistance;
            // count combinations that are problematic
            if (isNotOk) notok++;
        }
    }
    return notok === 0;
}

function difference(colorA, colorB) {
    return 0.5 * (chroma.deltaE(colorA, colorB) + chroma.deltaE(colorB, colorA));
}
