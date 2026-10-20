export const openTripSql = `
(
  IFNULL((
    SELECT d.dogadaj FROM Dogadaji d
    WHERE d.putovanje_id = p.id
    ORDER BY d.vrijeme DESC, d.id DESC
    LIMIT 1
  ), '') IN ('U procesu utovara', 'Utovaren')
  OR (
    (
      SELECT d.dogadaj FROM Dogadaji d
      WHERE d.putovanje_id = p.id
      ORDER BY d.vrijeme DESC, d.id DESC
      LIMIT 1
    ) = 'Otpremljen'
    AND NOT EXISTS (
      SELECT 1 FROM Dogadaji later
      WHERE later.kamion_id = p.kamion_id
        AND (
          later.vrijeme > (
            SELECT dx.vrijeme FROM Dogadaji dx
            WHERE dx.putovanje_id = p.id AND dx.dogadaj = 'Otpremljen'
            ORDER BY dx.vrijeme DESC, dx.id DESC
            LIMIT 1
          )
          OR (
            later.vrijeme = (
              SELECT dx.vrijeme FROM Dogadaji dx
              WHERE dx.putovanje_id = p.id AND dx.dogadaj = 'Otpremljen'
              ORDER BY dx.vrijeme DESC, dx.id DESC
              LIMIT 1
            )
            AND later.id > (
              SELECT dx.id FROM Dogadaji dx
              WHERE dx.putovanje_id = p.id AND dx.dogadaj = 'Otpremljen'
              ORDER BY dx.vrijeme DESC, dx.id DESC
              LIMIT 1
            )
          )
        )
    )
  )
)
`;
