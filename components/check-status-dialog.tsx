"use client"

import { useState, useEffect } from "react"
import { useCheckTransactionStatus, type Transaction } from "@/hooks/useTransactions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"

interface CheckStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function CheckStatusDialog({ open, onOpenChange, transaction }: CheckStatusDialogProps) {
  const checkStatus = useCheckTransactionStatus()

  const [statusData, setStatusData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckStatus = async () => {
    if (!transaction?.reference) return

    setIsLoading(true)
    try {
      const result = await checkStatus.mutateAsync(transaction.reference)
      setStatusData(result)
    } catch (error) {
      setStatusData({ error: error })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case "accept":
      case "success":
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "reject":
      case "fail":
      case "failed":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
      case "init_payment":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "timeout":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case "accept":
      case "success":
      case "completed":
        return "default"
      case "reject":
      case "fail":
      case "failed":
      case "error":
        return "destructive"
      case "pending":
      case "init_payment":
        return "secondary"
      case "timeout":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status?: string): string => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case "accept":
      case "success":
      case "completed":
        return "Accepté"
      case "reject":
      case "fail":
      case "failed":
      case "error":
        return "Rejeté"
      case "pending":
        return "En attente"
      case "init_payment":
        return "En traitement"
      case "timeout":
        return "Expiré"
      default:
        return status || "Inconnu"
    }
  }

  const handleClose = () => {
    setStatusData(null)
    setIsLoading(false)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open && transaction && !statusData && !isLoading) {
      handleCheckStatus()
    }
  }, [open, transaction])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vérifier le Statut de Transaction</DialogTitle>
          <DialogDescription>
            Vérification du statut en temps réel pour la transaction : {transaction?.reference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Vérification en cours...</span>
            </div>
          )}

          {statusData && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {getStatusIcon(statusData.status || statusData.transaction_status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Statut actuel :</span>
                    <Badge variant={getStatusColor(statusData.status || statusData.transaction_status)}>
                      {getStatusLabel(statusData.status || statusData.transaction_status)}
                    </Badge>
                  </div>
                  {statusData.message && (
                    <p className="text-sm text-muted-foreground">{statusData.message}</p>
                  )}
                </div>
              </div>

              {statusData.error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Erreur de vérification</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">
                    {statusData.error?.response?.data?.message || statusData.error?.message || "Une erreur est survenue"}
                  </p>
                </div>
              )}

              {statusData.details && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Détails supplémentaires :</h4>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(statusData.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !statusData && (
            <div className="text-center py-8 text-muted-foreground">
              Cliquez sur "Vérifier" pour obtenir le statut actuel
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Fermer
          </Button>
          {!statusData && !isLoading && (
            <Button
              onClick={handleCheckStatus}
              disabled={isLoading || !transaction}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
