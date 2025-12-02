"use client"

import type React from "react"

import { useChangeTransactionStatus, type Transaction } from "@/hooks/useTransactions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"

interface ChangeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function ChangeStatusDialog({ open, onOpenChange, transaction }: ChangeStatusDialogProps) {
  const changeStatus = useChangeTransactionStatus()

  const handleConfirm = () => {
    if (!transaction) return

    changeStatus.mutate(
      {
        status: "accept",
        reference: transaction.reference,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirmer le Changement de Statut
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir accepter cette transaction ?
            <br />
            <span className="font-medium">Référence : {transaction?.reference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Montant :</span>
                <br />
                <span className="font-semibold">{transaction?.amount} FCFA</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Téléphone :</span>
                <br />
                <span>{transaction?.phone_number}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeStatus.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={changeStatus.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {changeStatus.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer et Accepter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
