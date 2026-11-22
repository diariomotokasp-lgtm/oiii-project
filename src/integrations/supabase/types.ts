export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          active: boolean
          color: string | null
          created_at: string
          id: string
          initial_balance: number
          institution: string | null
          name: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          active?: boolean
          color?: string | null
          created_at?: string
          id?: string
          initial_balance?: number
          institution?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          active?: boolean
          color?: string | null
          created_at?: string
          id?: string
          initial_balance?: number
          institution?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          income_source_id: string | null
          kind: string
          notes: string | null
          recurrence: string
          settled_on: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          income_source_id?: string | null
          kind: string
          notes?: string | null
          recurrence?: string
          settled_on?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          income_source_id?: string | null
          kind?: string
          notes?: string | null
          recurrence?: string
          settled_on?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: false
            referencedRelation: "income_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          kind: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          kind: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          kind?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_checkins: {
        Row: {
          class_date: string
          created_at: string
          id: string
          notes: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          class_date: string
          created_at?: string
          id?: string
          notes?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          class_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_checkins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          active: boolean
          brand: string | null
          closing_day: number
          created_at: string
          due_day: number
          id: string
          limit_amount: number
          name: string
          payment_account_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand?: string | null
          closing_day?: number
          created_at?: string
          due_day?: number
          id?: string
          limit_amount?: number
          name: string
          payment_account_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand?: string | null
          closing_day?: number
          created_at?: string
          due_day?: number
          id?: string
          limit_amount?: number
          name?: string
          payment_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      dividends: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          id: string
          investment_id: string
          kind: string
          notes: string | null
          received_on: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          id?: string
          investment_id: string
          kind?: string
          notes?: string | null
          received_on: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          investment_id?: string
          kind?: string
          notes?: string | null
          received_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividends_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividends_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          id: string
          name: string
          notes: string | null
          target_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          name: string
          notes?: string | null
          target_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          name?: string
          notes?: string | null
          target_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      investment_movements: {
        Row: {
          account_id: string | null
          created_at: string
          fees: number
          id: string
          investment_id: string
          kind: string
          moved_on: string
          notes: string | null
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          fees?: number
          id?: string
          investment_id: string
          kind: string
          moved_on: string
          notes?: string | null
          quantity: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          fees?: number
          id?: string
          investment_id?: string
          kind?: string
          moved_on?: string
          notes?: string | null
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_movements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_movements_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          asset_type: string
          created_at: string
          current_price: number
          id: string
          name: string
          notes: string | null
          price_source: string
          price_updated_at: string | null
          ticker: string | null
          updated_at: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          current_price?: number
          id?: string
          name: string
          notes?: string | null
          price_source?: string
          price_updated_at?: string | null
          ticker?: string | null
          updated_at?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          current_price?: number
          id?: string
          name?: string
          notes?: string | null
          price_source?: string
          price_updated_at?: string | null
          ticker?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_payments: {
        Row: {
          account_id: string
          amount: number
          card_id: string
          created_at: string
          id: string
          notes: string | null
          paid_on: string
          reference_month: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          card_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_on: string
          reference_month: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          card_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_on?: string
          reference_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          done: boolean
          id: string
          notes: string | null
          priority: string
          remind_on: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          priority?: string
          remind_on: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          priority?: string
          remind_on?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_payments: {
        Row: {
          account_id: string | null
          amount: number
          classes_credited: number
          created_at: string
          id: string
          notes: string | null
          paid_on: string
          student_id: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          classes_credited?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_on: string
          student_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          classes_credited?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_on?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          billing_type: string
          classes_per_package: number
          created_at: string
          id: string
          income_source_id: string | null
          name: string
          notes: string | null
          phone: string | null
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_type?: string
          classes_per_package?: number
          created_at?: string
          id?: string
          income_source_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_type?: string
          classes_per_package?: number
          created_at?: string
          id?: string
          income_source_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: false
            referencedRelation: "income_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          done: boolean
          due_on: string | null
          id: string
          notes: string | null
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          due_on?: string | null
          id?: string
          notes?: string | null
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          due_on?: string | null
          id?: string
          notes?: string | null
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          bill_id: string | null
          card_id: string | null
          category_id: string | null
          created_at: string
          description: string
          dividend_id: string | null
          id: string
          income_source_id: string | null
          installment_group: string | null
          installment_number: number | null
          installment_total: number | null
          kind: string
          notes: string | null
          occurred_on: string
          recurrence_group: string | null
          status: string
          student_payment_id: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          bill_id?: string | null
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          description: string
          dividend_id?: string | null
          id?: string
          income_source_id?: string | null
          installment_group?: string | null
          installment_number?: number | null
          installment_total?: number | null
          kind: string
          notes?: string | null
          occurred_on: string
          recurrence_group?: string | null
          status?: string
          student_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          bill_id?: string | null
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          dividend_id?: string | null
          id?: string
          income_source_id?: string | null
          installment_group?: string | null
          installment_number?: number | null
          installment_total?: number | null
          kind?: string
          notes?: string | null
          occurred_on?: string
          recurrence_group?: string | null
          status?: string
          student_payment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_dividend_id_fkey"
            columns: ["dividend_id"]
            isOneToOne: false
            referencedRelation: "dividends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: false
            referencedRelation: "income_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_student_payment_id_fkey"
            columns: ["student_payment_id"]
            isOneToOne: false
            referencedRelation: "student_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          from_account_id: string
          id: string
          to_account_id: string
          transferred_on: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          from_account_id: string
          id?: string
          to_account_id: string
          transferred_on: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          from_account_id?: string
          id?: string
          to_account_id?: string
          transferred_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_card_purchase: {
        Args: {
          p_card_id: string
          p_category_id: string
          p_date: string
          p_description: string
          p_installments: number
          p_notes: string
          p_total: number
        }
        Returns: string
      }
      register_dividend: {
        Args: {
          p_account_id: string
          p_amount: number
          p_date: string
          p_income_source_id: string
          p_investment_id: string
          p_kind: string
          p_notes: string
        }
        Returns: string
      }
      register_student_payment: {
        Args: {
          p_account_id: string
          p_amount: number
          p_classes: number
          p_date: string
          p_notes: string
          p_student_id: string
        }
        Returns: string
      }
      settle_bill: {
        Args: { p_account_id: string; p_bill_id: string; p_date: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
