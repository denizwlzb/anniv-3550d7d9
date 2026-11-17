/* ===== À PERSONNALISER : prénom, blagues, ennemis ===== */
const CONFIG = {
  name: `LE HÉROS`,
  age: 20,
  title: `LA QUÊTE DU SHOE STORE`,
  intro: [`Le magasin de chaussures est à la fin du niveau.`, `Le vendeur refuse de te laisser entrer.`, `Écrase tout. Prends toutes les paires.`],
  items: [
    [`👟`, `Paire n°1 ! Tu en as déjà 47, il t'en faut une 48e.`],
    [`👟`, `Des Air Jordan ? Non, des Air Pas-de-budget.`],
    [`🥾`, `Des bottes ! Pour marcher jusqu'au magasin.`],
    [`👞`, `Des mocassins. Pour le mariage de personne.`],
    [`🩴`, `Des claquettes-chaussettes. Style validé.`],
    [`👟`, `Édition limitée ! Plus que 3 000 exemplaires.`],
    [`👠`, `Des talons ? Aucun jugement ici.`],
    [`💸`, `Ton compte en banque vient de pleurer.`]
  ],
  enemies: [
    [`🧾`, `Le Ticket de caisse`, `Ticket froissé et jeté.`],
    [`📏`, `La Pointure trop petite`, `Pointure 43 en 44. Ça passera pas.`],
    [`🧦`, `La Chaussette trouée`, `Orteil sauvé, chaussette vaincue.`],
    [`🚫`, `La Contrefaçon`, `Faux sneaker détecté. BONK.`]
  ],
  boss: { emoji: `🤵`, name: `LE VENDEUR`, hp: 3,
          hit: [`« On n'a plus ta taille ! »`, `« C'est la dernière paire, elle est réservée ! »`, `« Bon… OK… entre. »`] },
  lose: [`💀 Même ta chute est stylée.`, `Rate pas ton saut, c'est ton anniv !`, `Ça arrive aux meilleurs.`, `On va dire que c'était volontaire.`],
  win: [`JOYEUX ANNIVERSAIRE !`, `Le magasin est à toi. Tout est gratuit.`, `Level up : +1 an. Toujours aussi légendaire.`],
  signature: `— de la part de tes potes`,
  emotes: [`😂`, `💀`, `🔥`, `👟`, `🗿`, `😎`]
};
